<?php

namespace App\Http\Controllers;

use App\Constants\InventoryHistoryType;
use App\Constants\OrderStatus;
use App\Jobs\ExportOrderReportJob;
use App\Models\Customer;
use App\Models\DataExport;
use App\Models\Inventory;
use App\Models\InventoryHistory;
use App\Models\Order;
use App\Models\Product;
use App\Traits\InventoryHistoryTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    use InventoryHistoryTrait;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $query = Order::query();

        if ($search) {
            $query->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('productOrders.product', function ($row) use ($search) {
                    $row->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                })
                ->orWhereHas('customer', function ($row) use ($search) {
                    $row->where('fullname', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('know_from', 'like', "%{$search}%");
                });
        }

        if ($request->has('statuses') && !empty($request->statuses)) {
            if (is_array($request->statuses)) {
                $query->whereIn('status', $request->statuses);
            } else {
                $query->whereIn('status', explode(',', $request->statuses));
            }
        }

        if ($request->has('checkout_type') && !empty($request->checkout_type)) {
            $query->where('checkout_type', $request->checkout_type);
        }
        $startDate = null;
        $endDate = null;
        if ($request->has('date_range') && !empty($request->date_range)) {
            if (!is_array($request->date_range)) {
                $date = explode(',', $request->date_range);
                $startDate = $date[0];
                $query->whereDate('created_at', '>=', $startDate);
                if (!empty($date[1])) {
                    $endDate = $date[1];
                    $query->whereDate('created_at', '<=', $endDate);
                }
            }
        }

        $orders = $query->with('customer', 'productOrders.product')->orderBy('created_at', 'desc')->paginate(10)
            ->withQueryString();
        $statuses = OrderStatus::getSelectOption();

        return Inertia::render('Order/Index', [
            'orders' => $orders,
            'statuses' => $statuses,
            'filters' => [
                'search' => $search,
                'date_range' => [
                    'startDate' => $startDate,
                    'endDate' => $endDate
                ]
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $products = Product::all();
        $customers = Customer::select('id', 'fullname', 'email')->get();
        $statuses = OrderStatus::getSelectOption();
        $statusDescriptions = OrderStatus::getStatusDetails();
        return Inertia::render('Order/Create', [
            'products' => $products,
            'customers' => $customers,
            'statuses' => $statuses,
            'statusDescriptions' => $statusDescriptions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_number' => ['required', Rule::unique('orders', 'order_number')],
            'customer_id' => ['required', Rule::exists('customers', 'id')],
            'total' => ['required', 'min:1'],
            'checkout_type' => ['required'],
            'status' => ['nullable'],
            'product_orders' => ['required', 'array'],
            'product_orders.*.product_id' => [
                'required',
                Rule::exists('products', 'id')
            ],
            'product_orders.*.quantity' => [
                'required',
                'min:1'
            ],
            'created_at' => ['nullable'],
        ], [
            'order_number.required' => 'Nomor order diperlukan. Silahkan generate nomor order',
            'order_number.unique' => 'Order number sudah ada pada data. Silahkan generate ulang nomor order',
            'customer_id.required' => 'Customer diperlukan',
            'customer_id.exists' => 'Data customer tidak ditemukan atau telah terhapus',
            'checkout_type.required' => 'Tipe checkout diperlukan'
        ]);

        $validator->after(function ($validator) use ($request) {
            $productOrders = $request->input('product_orders', []);
            foreach ($productOrders as $product) {
                if (empty($product['product_id'])) {
                    $validator->errors()->add('product_orders', 'Produk diperlukan');
                } else {
                    $inventory = Inventory::where('product_id', $product['product_id'])->first();
                    $quantity = $product['quantity'];
                    if ($quantity > $inventory->stock) {
                        $validator->errors()->add('product_orders', 'Stok produk kurang. Harap sesuaikan pada inventory');
                    }
                }
            }
        });

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        DB::beginTransaction();
        try {
            $order = Order::create($request->except('product_orders'));
            foreach ($request->product_orders as $product) {
                $order->productOrders()->create([
                    'product_id' => $product['product_id'],
                    'quantity' => $product['quantity'],
                ]);

                $inventory = Inventory::where('product_id', $product['product_id'])->first();
                $this->storeHistories($inventory, [
                    'stock' => $inventory->stock - $product['quantity'],
                    'description' => "Pengurangan stok dari order sebesar {$product['quantity']} : {$order->order_number}"
                ], Auth::user()->id, InventoryHistoryType::STOCK_ADJUSMENT()->getValue());
                // Sync Inventory
                Inventory::where('product_id', $product['product_id'])
                    ->decrement('stock', $product['quantity']);
            }

            DB::commit();
            return redirect()->route('orders.index')->with('success', 'Data pesanan berhasil ditambahkan');
        } catch (\Exception $err) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat membuat order. Harap mengulang kembali proses Anda');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $order = Order::with(['productOrders.product.category', 'customer'])->find($id);
        $products = Product::all();
        $customers = Customer::select('id', 'fullname', 'email')->get();
        $statuses = OrderStatus::getSelectOption();
        $statusDescriptions = OrderStatus::getStatusDetails();
        return Inertia::render('Order/Edit', [
            'products' => $products,
            'customers' => $customers,
            'order' => $order,
            'statuses' => $statuses,
            'statusDescriptions' => $statusDescriptions
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'order_number' => ['required', Rule::unique('orders', 'order_number')->ignore($id)],
            'customer_id' => ['required', Rule::exists('customers', 'id')],
            'total' => ['required', 'min:1'],
            'checkout_type' => ['required'],
            'status' => ['nullable'],
            'product_orders' => ['required', 'array'],
            'product_orders.*.product_id' => [
                'required',
                Rule::exists('products', 'id')
            ],
            'product_orders.*.quantity' => [
                'required',
                'min:1'
            ],
            'created_at' => ['nullable'],
        ], [
            'order_number.required' => 'Nomor order diperlukan. Silahkan generate nomor order',
            'order_number.unique' => 'Order number sudah ada pada data. Silahkan generate ulang nomor order',
            'customer_id.required' => 'Customer diperlukan',
            'customer_id.exists' => 'Data customer tidak ditemukan atau telah terhapus',
            'checkout_type.required' => 'Tipe checkout diperlukan'
        ]);

        $validator->after(function ($validator) use ($request) {
            $productOrders = $request->input('product_orders', []);
            foreach ($productOrders as $product) {
                if (empty($product['product_id'])) {
                    $validator->errors()->add('product_orders', 'Produk diperlukan');
                } else {
                    $inventory = Inventory::where('product_id', $product['product_id'])->first();
                    if (!$inventory) {
                        $validator->errors()->add('product_orders', 'Inventory produk tidak ditemukan');
                        continue;
                    }

                    $quantity = $product['quantity'];
                    // If the product is new or the quantity increases, make sure there is sufficient stock.
                    if (empty($product['id'])) {
                        if ($quantity > $inventory->stock) {
                            $validator->errors()->add('product_orders', 'Stok produk kurang. Harap sesuaikan pada inventory');
                        }
                    } else {
                        // If an ID exists, we check whether the requested quantity exceeds the current stock.
                        // However, this requires a comparison with the old quantity; simply initial validation.
                        // Ensures the requested quantity does not exceed (current stock + oldQty).
                        $existingOrder = \App\Models\ProductOrder::find($product['id']);
                        if ($existingOrder) {
                            $oldQty = $existingOrder->quantity;
                            $diff = $product['quantity'] - $oldQty;
                            if ($diff > 0 && $diff > $inventory->stock) {
                                $validator->errors()->add('product_orders', "Stok produk kurang untuk produk ID {$product['product_id']}. Tambahan qty {$diff} tidak tersedia.");
                            }
                        }
                    }
                }
            }
        });

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        DB::beginTransaction();
        try {
            $order = Order::findOrFail($id);

            // Retrieve all existing productOrders for quick reference
            $existingProductOrders = $order->productOrders()->get()->keyBy('id');

            // Loop input product_orders
            foreach ($request->product_orders as $product) {
                $productId = $product['product_id'];
                $qty = (int)$product['quantity'];
                $prodOrderId = $product['id'] ?? null;

                // retrieve the related inventory
                $inventory = Inventory::where('product_id', $productId)->first();
                if (!$inventory) {
                    return redirect()->back()->with('error', "Inventory untuk product_id {$productId} tidak ditemukan");
                }

                // NEW product order (create)
                if (empty($prodOrderId)) {
                    // direct stock decrement (previously validated)
                    if ($qty > 0) {
                        // store history BEFORE update stock (optional: capture old stock)
                        $this->storeHistories($inventory, [
                            'stock' => $inventory->stock - $qty,
                            'description' => "Pengurangan stok dari order sebesar {$qty} : {$request->order_number}"
                        ], Auth::user()->id, InventoryHistoryType::STOCK_ADJUSMENT()->getValue());

                        $inventory->decrement('stock', $qty);
                    }

                    $order->productOrders()->create([
                        'product_id' => $productId,
                        'quantity' => $qty,
                    ]);

                    continue;
                }

                // EXISTING product order handling
                $productOrder = $existingProductOrders->get($prodOrderId);
                if (!$productOrder) {
                    // maybe the id is invalid for this order
                    continue;
                }

                // If marked deleted
                if (!empty($product['is_deleted'])) {
                    $oldQty = $productOrder->quantity;

                    if ($oldQty > 0) {
                        // restore stock by oldQty
                        $this->storeHistories($inventory, [
                            'stock' => $inventory->stock + $oldQty,
                            'description' => "Penambahan stok dari order sebesar {$oldQty} karena produk dihapus dari order : {$request->order_number}"
                        ], Auth::user()->id, InventoryHistoryType::STOCK_ADJUSMENT()->getValue());

                        $inventory->increment('stock', $oldQty);
                    }

                    // remove product order
                    $productOrder->delete();
                    continue;
                }

                // Not deleted -> check quantity change
                $oldQty = $productOrder->quantity;
                $diff = $qty - $oldQty;

                if ($diff === 0) {
                    // nothing to do except maybe update if other fields changed
                    // but we still ensure quantity saved (in case)
                    if ($productOrder->quantity !== $qty) {
                        $productOrder->quantity = $qty;
                        $productOrder->save();
                    }
                    continue;
                }

                if ($diff > 0) {
                    // quantity increased: decrease inventory by diff
                    if ($diff > $inventory->stock) {
                        return redirect()->back()->with('error', "Stok tidak mencukupi untuk menambah qty produk ID {$productId}");
                    }

                    $this->storeHistories($inventory, [
                        'stock' => $inventory->stock - $diff,
                        'description' => "Pengurangan stok karena penambahan quantity pada order sebanyak {$diff} : {$request->order_number}"
                    ], Auth::user()->id, InventoryHistoryType::STOCK_ADJUSMENT()->getValue());

                    $inventory->decrement('stock', $diff);
                } else { // diff < 0
                    // quantity decreased: restore inventory by -diff
                    $restore = abs($diff);
                    $this->storeHistories($inventory, [
                        'stock' => $inventory->stock + $restore,
                        'description' => "Penambahan stok karena pengurangan quantity pada order sebanyak {$restore} : {$request->order_number}"
                    ], Auth::user()->id, InventoryHistoryType::STOCK_ADJUSMENT()->getValue());

                    $inventory->increment('stock', $restore);
                }

                // update product order quantity
                $productOrder->quantity = $qty;
                $productOrder->save();
            }

            // Optional: Recalculate order total from product_orders (server-side truth)
            $newTotal = $order->productOrders()->get()->reduce(function ($carry, $po) use ($order) {
                $product = $po->product;
                $price = $product ? $product->price : 0;
                return $carry + ($price * $po->quantity);
            }, 0);

            $order->total = $newTotal;
            // update other order fields if needed (customer_id, status, checkout_type)
            $order->order_number = $request->order_number;
            $order->customer_id = $request->customer_id;
            $order->checkout_type = $request->checkout_type;
            $order->status = $request->status;
            $order->created_at = $request->created_at;
            $order->save();

            DB::commit();
            return redirect()->back()->with('success', 'Order berhasil dirubah!');
        } catch (\Exception $err) {
            Log::info('error update order : ' . $err->getMessage());
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat membuat order. Harap mengulang kembali proses Anda');
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        Order::where('id', $id)->delete();
        return redirect()->back()->with('success', 'Data order berhasil dihapus!');
    }

    public function exportOrders(Request $request)
    {
        $request->validate([
            'date_start' => 'required|date',
            'date_end' => 'required|date|after_or_equal:date_start',
            'status' => 'nullable|array',
            'status.*' => 'string',
        ]);

        $filters = [
            'date_start' => $request->date_start,
            'date_end' => $request->date_end,
            'status' => $request->status ?? [],
        ];

        $export = DataExport::create([
            'export_type' => 'order',
            'filters' => $filters,
            'status' => 'pending',
        ]);

        dispatch(new ExportOrderReportJob($export));

        return redirect()->back()->with('success', 'Proses ekspor order telah dilakukan. Mohon periksa pada list menu Eksport!');
    }

    public function generateOrderNumber()
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

        return response()->json(['order_number' => $newSku]);
    }
}
