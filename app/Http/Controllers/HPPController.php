<?php

namespace App\Http\Controllers;

use App\Jobs\ProductionBatchJob;
use App\Models\Category;
use App\Models\HppBatchHistory;
use App\Models\HppComposition;
use App\Models\HppCompositionCategory;
use App\Models\HppCompositionItem;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class HPPController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $query = HppComposition::query();

        if ($search) {
            $query->whereHas('inventory', function ($row) use ($search) {
                $row->where('name', 'like', "%{$search}%")
                    ->where('sku', 'like', "%{$search}%");
            });
        }

        $hppCompositions = $query->with('hppItems.inventory', 'hppItems.hppCategory', 'inventory')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('HPP/Index', [
            'hppCompositions' => $hppCompositions,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    public function create()
    {
        $inventoryProducts = Inventory::whereNotNull('product_id')
            ->whereDoesntHave('hppCompositions')
            ->get();
        $inventories = Inventory::where('product_id', null)->get();
        return Inertia::render('HPP/Create', [
            'inventoryProducts' => $inventoryProducts,
            'inventories' => $inventories
        ]);
    }

    public function show(Request $request, int $id)
    {
        $inventoryProducts = Inventory::whereNotNull('product_id')
            ->whereDoesntHave('hppCompositions', function ($query) use ($id) {
                $query->where('id', '!=', $id);
            })
            ->get();
        $inventories = Inventory::where('product_id', null)->get();
        $hppComposition = HppComposition::with('inventory', 'hppCategories', 'hppItems.hppCategory', 'hppItems.inventory')
            ->find($id);

        $query = HppBatchHistory::query();
        $search = $request->get('search', '');
        if ($search) {
            $query->whereHas('user', function ($row) use ($search) {
                $row->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $hppHistories = $query->where('hpp_composition_id', $id)
        ->with('hppComposition.inventory', 'user')->orderBy('created_at', 'desc')
        ->paginate(10);
        return Inertia::render('HPP/Edit', [
            'inventoryProducts' => $inventoryProducts,
            'inventories' => $inventories,
            'hppComposition' => $hppComposition,
            'hppHistories' => $hppHistories,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'inventory_id' => ['required', Rule::exists('inventories', 'id')],
            'labor_cost' => ['nullable'],
            'production_batch' => ['required', 'min:0'],
            'hpp_items' => ['required', 'array'],
            'hpp_items.*.category_name' => ['required'],
            'hpp_items.*.inventory_id' => ['required', Rule::exists('inventories', 'id')],
            'hpp_items.*.stock_used' => ['required', 'min:0'],
            'hpp_items.*.total_price_inventory' => ['required', 'min:0'],
        ], [
            'inventory_id.required' => 'Silahkan pilih produk/inventori',
            'inventory_id.exists' => 'Inventori/Produk telah dihapus. Mohon periksa kembali',
            'production_batch' => 'Silahkan mengisi batch produksi',
            'hpp_items.*.category_name.required' => 'Mohon mengisi kategori untuk setiap stok',
            'hpp_items.*.inventory_id.required' => 'Mohon memilih inventori untuk HPP stok',
            'hpp_items.*.stock_used.required' => 'Mohon mengisi jumlah stok yang akan digunakan'
        ]);

        $hppCompositionInput = $request->only('inventory_id', 'labor_cost', 'production_batch');
        $hppComposition = HppComposition::create($hppCompositionInput);

        foreach ($request->input('hpp_items') as $hppItem) {
            $category = HppCompositionCategory::firstOrCreate([
                'hpp_composition_id' => $hppComposition->id,
                'category_name' => $hppItem['category_name'],
            ], [
                'hpp_composition_id' => $hppComposition->id,
                'category_name' => $hppItem['category_name'],
            ]);

            $hppComposition->hppItems()->create([
                'hpp_category_id' => $category->id,
                'inventory_id' => $hppItem['inventory_id'],
                'stock_used' => $hppItem['stock_used'],
                'total_price_inventory' => $hppItem['total_price_inventory'],
            ]);
        }

        return redirect()->route('hpp-compositions.index')->with('success', 'Komposisi HPP berhasil ditambahkan');
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'inventory_id' => ['required', Rule::exists('inventories', 'id')],
            'labor_cost' => ['nullable'],
            'production_batch' => ['required', 'min:0'],
            'hpp_items' => ['required', 'array'],
            'hpp_items.*.category_name' => ['required'],
            'hpp_items.*.inventory_id' => ['required', Rule::exists('inventories', 'id')],
            'hpp_items.*.stock_used' => ['required', 'min:0'],
            'hpp_items.*.total_price_inventory' => ['required', 'min:0'],
        ], [
            'inventory_id.required' => 'Silahkan pilih produk/inventori',
            'inventory_id.exists' => 'Inventori/Produk telah dihapus. Mohon periksa kembali',
            'production_batch' => 'Silahkan mengisi batch produksi',
            'hpp_items.*.category_name.required' => 'Mohon mengisi kategori untuk setiap stok',
            'hpp_items.*.inventory_id.required' => 'Mohon memilih inventori untuk HPP stok',
            'hpp_items.*.stock_used.required' => 'Mohon mengisi jumlah stok yang akan digunakan'
        ]);

        $hppComposition = HppComposition::with(['hppCategories', 'hppItems'])->findOrFail($id);

        // Update parent composition
        $hppComposition->update($request->only(
            'inventory_id',
            'labor_cost',
            'production_batch'
        ));

        // Process every incoming HPP item
        foreach ($request->hpp_items as $item) {
            $categoryData = $item['hpp_category'];
            $isCategoryDeleted = $categoryData['is_deleted'] ?? false;

            // Delete category if flagged
            if (!empty($categoryData['id']) && $isCategoryDeleted) {
                HppCompositionCategory::where('id', $categoryData['id'])->delete();
                continue;
            }

            // Create or update category
            if ($categoryData['id'] <= 0) {
                // Temp ID: create new category
                $category = HppCompositionCategory::create([
                    'hpp_composition_id' => $hppComposition->id,
                    'category_name' => $categoryData['category_name'],
                ]);
            } else {
                // Existing category, update name if changed
                $category = HppCompositionCategory::find($categoryData['id']);
                if ($category) {
                    $category->update(['category_name' => $categoryData['category_name']]);
                }
            }

            // Handle HPP Item
            if (isset($item['is_deleted']) && $item['is_deleted']) {
                // Delete item
                if (!empty($item['id'])) {
                    HppCompositionItem::where('id', $item['id'])->delete();
                }
                continue;
            }

            // Update or create item
            HppCompositionItem::updateOrCreate(
                ['id' => $item['id'] ?? null],
                [
                    'hpp_composition_id' => $hppComposition->id,
                    'hpp_category_id' => $category->id,
                    'inventory_id' => $item['inventory_id'],
                    'stock_used' => $item['stock_used'],
                    'total_price_inventory' => $item['total_price_inventory'],
                ]
            );
        }

        $inventoryProducts = Inventory::whereNotNull('product_id')
            ->whereDoesntHave('hppCompositions', function ($query) use ($id) {
                $query->where('id', '!=', $id);
            })
            ->get();
        $inventories = Inventory::where('product_id', null)->get();
        $hppComposition = HppComposition::with('inventory', 'hppCategories', 'hppItems.hppCategory', 'hppItems.inventory')
            ->find($id);

        return Inertia::render('HPP/Edit', [
            'flash' => ['success' => 'Komposisi HPP berhasil diubah!'],
            'inventoryProducts' => $inventoryProducts,
            'inventories' => $inventories,
            'hppComposition' => $hppComposition,
        ]);
    }

    public function destroy(int $id)
    {
        HppComposition::where('id', $id)->delete();
        return redirect()->back()->with('sucess', 'Komposisi HPP berhasil dihapus');
    }

    public function deployBatch(Request $request, int $id)
    {
        $request->validate([
            'requested_batch' => ['required', 'integer'],
        ], [
            'requested_batch.required' => 'Mohon mengisi permintaan batch' 
        ]);

        $hppComposition = HppComposition::find($id);
        ProductionBatchJob::dispatch($hppComposition, $request->requested_batch, Auth::user()->id);
        return redirect()->back()->with('success', 'Proses batch sedang diproses mohon periksa notifikasi secara berkala untuk melihat proses status');
    }
}
