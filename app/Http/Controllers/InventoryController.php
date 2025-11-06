<?php

namespace App\Http\Controllers;

use App\Constants\InventoryHistoryType;
use App\Models\Inventory;
use App\Models\InventoryHistory;
use App\Models\Product;
use App\Http\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Traits\InventoryHistoryTrait;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    use InventoryHistoryTrait;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $query = Inventory::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhereHas('product', function ($row) use ($search) {
                    $row->where('name', 'like', "%{$search}%");
                })
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%");
        }

        if ($request->has('stock') && !empty($request->stock)) {
            $stock = $request->stock;

            if ($stock == 'normal') {
                $query->where('stock', '>=', 30);
            }

            if ($stock == 'thinning') {
                $query->where('stock', '>=', 10)->where('stock', '<', 30);
            }

            if ($stock == 'less') {
                $query->where('stock', '<=', 10);
            }
        }

        if ($request->has('is_from_product')) {
            $isFromProduct = $request->get('is_from_product', '1');
            if ($isFromProduct == '1') {
                $query->whereNotNull('product_id');
            } else {
                $query->whereNull('product_id');
            }
        }

        $inventories = $query->with('product')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();
        return Inertia::render('Inventory/Index', [
            'inventories' => $inventories,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $products = Product::with('category:id,name')->get();
        return Inertia::render('Inventory/Create', [
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required'],
            'product_id' => ['nullable', Rule::exists('products', 'id')],
            'price' => ['required'],
            'description' => ['nullable'],
            'sku' => ['required'],
            'stock' => ['required'],
            'measurement' => ['required'],
        ], [
            'name.required' => 'Nama inventory diperlukan',
            'price.required' => 'Harga inventory dibutuhkan',
            'sku.required' => 'SKU inventory dibutuhkan',
            'stock.required' => 'Stock inventory harus diisi',
            'measurement.required' => 'Satuan inventory harus dipilih',
        ]);

        $productId = $request->input('product_id', null);
        $product = Product::where('name', rtrim($request->name))->first();
        if ($product) {
            $productId = $product->id;
        }
        $input = $request->all();
        $input['product_id'] = $productId;
        Inventory::create($input);
        return redirect()->route('inventories.index')->with('success', 'Data inventory berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, int $id)
    {
        $inventory = Inventory::with('product')->find($id);
        $products = Product::with('category:id,name')->get();
        $query = InventoryHistory::query();

        $search = $request->get('search', '');
        if ($search) {
            $query->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('previous_value', 'like', "%{$search}%")
                ->orWhere('current_value', 'like', "%{$search}%")
                ->orWhereHas('user', function ($row) use ($search) {
                    $row->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        }

        if ($request->has('type') && !empty($request->type)) {
            $query->where('type', $request->type);
        }

        $inventoryHistories = $query->where('inventory_id', $id)->with('user:id,name,email')->orderBy('created_at', 'desc')
            ->paginate(10);
        return Inertia::render('Inventory/Edit', [
            'products' => $products,
            'inventory' => $inventory,
            'inventoryHistories' => $inventoryHistories,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id) {}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => ['required'],
            'product_id' => ['nullable', Rule::exists('products', 'id')],
            'price' => ['required'],
            'description' => ['nullable'],
            'sku' => ['required'],
            'stock' => ['required'],
            'measurement' => ['required'],
        ], [
            'name.required' => 'Nama inventory diperlukan',
            'price.required' => 'Harga inventory dibutuhkan',
            'sku.required' => 'SKU inventory dibutuhkan',
            'stock.required' => 'Stock inventory harus diisi',
            'measurement.required' => 'Satuan inventory harus dipilih',
        ]);
        $inventory = Inventory::find($id);
        $productId = $request->input('product_id', $inventory->product_id);
        $product = Product::where('name', rtrim($request->name))->first();
        if ($product) {
            $productId = $product->id;
        }
        $input = $request->except('product');
        $input['product_id'] = $productId;
        Inventory::where('id', $id)->update($input);
        $this->storeHistories($inventory, $request->except('description'), Auth::user()->id);
        return redirect()->back()->with('success', 'Inventory berhasil dirubah!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        Inventory::where('id', $id)->delete();
        return redirect()->back()->with('success', 'Inventory berhasil dihapus!');
    }

    public function generateSku()
    {
        $prefix = 'TOKCER';
        $datePart = now()->format('dmY');

        $lastSku = Inventory::where('sku', 'like', "{$prefix}/{$datePart}/%")
            ->orderByDesc('sku')
            ->value('sku');

        if ($lastSku) {
            $lastNumber = (int) Str::afterLast($lastSku, '/');
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        $formattedNumber = str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

        $newSku = "{$prefix}/{$datePart}/{$formattedNumber}";

        return response()->json(['sku' => $newSku]);
    }

    public function adjustStock(Request $request, int $id)
    {
        $request->validate([
            'stock' => ['required', 'min:1'],
            'type' => ['required', 'in:add,reduce'],
            'description' => ['required'],
            'final_stock' => ['required', 'min:0']
        ], [
            'stock.required' => 'Harap isi jumlah stok',
            'type.required' => 'Harap pilih jenis penyesuaian',
            'type.in' =>  'Harap pilih jenis penyesuaian',
            'description.required' => 'Harap isi deskripsi',
            'final_stock.min' => 'Stok akhir tidak boleh mines'
        ]);
        $currentInventory = Inventory::find($id);
        $input = $request->only(['stock', 'description', 'final_stock']);
        $typeBahasa = '';
        if ($request->type == 'add') {
            Inventory::where('id', $id)->increment('stock', $input['stock']);
            $typeBahasa = 'Penambahan';
        }

        if ($request->type == 'reduce') {
            Inventory::where('id', $id)->decrement('stock', $input['stock']);
            $typeBahasa = 'Pengurangan';
        }
        $message = "Terjadi {$typeBahasa} stok sebesar {$input['stock']}";
        $dataHistory = [
            'description' => "{$message}: {$input['description']}",
            'stock' => $input['final_stock']
        ];
        $user = Auth::user();
        $this->storeHistories($currentInventory, $dataHistory, Auth::user()->id, InventoryHistoryType::STOCK_ADJUSMENT()->getValue());
        NotificationService::sendNotification([
            'title' => "Penyesuain Stok",
            'description' => "Terjadi penyesuain stok yang dilakukan oleh {$user->name}",
            'link' => route('inventories.show', $currentInventory->id)
        ]);
        return redirect()->route('inventories.index')
            ->with('filters', null)
            ->with('success', 'Stock inventory berhasil disesuaikan');
    }
}
