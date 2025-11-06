<?php

namespace App\Http\Controllers\Api;

use App\Constants\InventoryHistoryType;
use App\Constants\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\NotificationService;
use App\Models\Customer;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use App\Traits\InventoryHistoryTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    use InventoryHistoryTrait;
    
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'carts' => ['required', 'array', 'min:1'],
            'carts.*.product_id' => ['required', Rule::exists('products', 'id')],
            'carts.*.quantity' => ['required', 'integer', 'min:1'],
            'fullname' => ['required', 'string'],
            'email' => ['required', 'email'],
            'phone_code' => ['required', 'string'],
            'phone_number' => ['required', 'string'],
            'age' => ['required', 'integer', 'min:21'],
            'address' => ['required', 'string'],
            'know_from' => ['nullable', 'string'],
            'checkout_type' => ['required', 'string'],
            'notes' => ['nullable', 'string']
        ], [
            'carts.required' => 'Harap memilih produk Anda',
            'carts.*.quantity.required' => 'Harap masukkan jumlah produk yang ingin Anda beli',
            'fullname.required' => 'Harap masukkan nama lengkap Anda',
            'email.required' => 'Harap masukkan email Anda',
            'email.email' => 'Email tidak valid',
            'phone_number.required' => 'Harap masukkan nomor HP/WhatsApp Anda',
            'age.required' => 'Harap masukkan umur Anda',
            'address.required' => 'Harap masukkan alamat Anda',
            'checkout_type.required' => 'Harap pilih tipe checkout',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'failed',
                'message' => $validator->errors()->all(),
                'data' => null
            ], 422);
        }

        DB::beginTransaction();

        try {
            $customer = Customer::updateOrCreate(
                ['email' => $request->email],
                [
                    'fullname' => $request->fullname,
                    'phone_code' => $request->phone_code,
                    'phone_number' => $request->phone_number,
                    'age' => $request->age,
                    'address' => $request->address,
                    'know_from' => $request->know_from,
                ]
            );

            $productIds = collect($request->carts)->pluck('product_id')->toArray();
            $inventories = Inventory::with('product:id,name,price')
                ->whereIn('product_id', $productIds)
                ->get()
                ->keyBy('product_id');

            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'customer_id' => $customer->id,
                'checkout_type' => $request->checkout_type,
                'status' => OrderStatus::PROCESS_PAYMENT()->getValue(),
                'notes' => $request->notes,
                'total' => 0, // counting in below
            ]);

            $total = 0;
            $productOrders = [];

            foreach ($request->carts as $cart) {
                $inventory = $inventories[$cart['product_id']] ?? null;
                if (!$inventory) {
                    $product = Product::find($cart['product_id']);
                    return response()->json([
                        'status' => 'out_of_stock',
                        'message' => "Stok {$product->name} telah habis",
                        'data' => null,
                    ], 422);
                }

                if ($inventory->stock < $cart['quantity']) {
                    $product = Product::find($cart['product_id']);
                    return response()->json([
                        'status' => 'out_of_stock',
                        'message' => "Stok {$product->name} telah habis",
                        'data' => null,
                    ], 422);
                }

                $subtotal = $inventory->product->price * $cart['quantity'];
                $total += $subtotal;

                $productOrders[] = [
                    'order_id' => $order->id,
                    'product_id' => $inventory->product_id,
                    'quantity' => $cart['quantity'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $this->storeHistories($inventory, [
                    'stock' => $inventory->stock - ((int)$cart['quantity']),
                    'description' => "Terjadi pengurangan inventory dari pesanan customer sebesar {$cart['quantity']} dari nomor order {$order->order_number}"
                ], null, InventoryHistoryType::STOCK_ADJUSMENT()->getValue());

                NotificationService::sendNotification([
                    'title' => "Penyesuain Stok",
                    'description' => "Terjadi pengurangan inventory dari pesanan customer sebesar {$cart['quantity']} dari nomor order {$order->order_number}",
                    'link' => route('inventories.show', $inventory->id)
                ]);

                $inventory->decrement('stock', $cart['quantity']);
            }

            DB::table('product_orders')->insert($productOrders);

            NotificationService::sendNotification([
                'title' => "Order Baru Masuk: {$order->order_number}",
                'description' => "Order baru telah masuk. Harap periksa data order tersebut.",
                'link' => route('orders.show', $order->id)
            ]);

            $order->update(['total' => $total]);


            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pesanan Anda berhasil dibuat. Silakan menunggu kontak dari admin kami.',
                'data' => [
                    'order_number' => $order->order_number,
                    'total' => $total,
                    'checkout_type' => $order->checkout_type,
                    'customer' => Customer::where('email', $request->email)->first(),
                    'products' => $order->productOrders()->with('product')->get(),
                    'status' => $order->status,
                ]
            ]);
        } catch (\Throwable $err) {
            DB::rollBack();
            Log::error('Checkout error: ' . $err->getMessage(), ['trace' => $err->getTraceAsString()]);

            return response()->json([
                'status' => 'failed',
                'message' => $err->getMessage() ?? 'Terjadi kesalahan. Mohon ulangi proses Anda.',
                'data' => null,
            ], 500);
        }
    }

    public function getDetailCheckout(Request $request)
    {
        $orderNumber = $request->get('orderNumber', null);
        if (!$orderNumber) {
            return response()->json([
                'data' => null,
                'message' => 'Nomor order diperlukan',
                'status' => 'not_found'
            ], 422);
        }

        $order = Order::where('order_number', $orderNumber)
        ->with('productOrders.product.inventory', 'customer')
        ->first();
        if (!$order) {
            return response()->json([
                'data' => null,
                'message' => 'Data order tidak ditemukan',
                'status' => 'not_found'
            ], 404);
        }

        return response()->json([
            'data' => $order,
            'message' => 'Data order ditemukan',
            'status' => 'success'
        ], 200);
    }

    private function generateOrderNumber()
    {
        $prefix = 'TOKCER-ORDER';
        $datePart = now()->format('dmY');

        $lastSku = Order::where('order_number', 'like', "{$prefix}/{$datePart}/%")
            ->orderByDesc('order_number')
            ->value('order_number');

        if ($lastSku) {
            $lastNumber = (int) Str::afterLast($lastSku, '/');
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        $formattedNumber = str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

        $newSku = "{$prefix}/{$datePart}/{$formattedNumber}";

        return $newSku;
    }
}
