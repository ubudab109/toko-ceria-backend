<?php

namespace App\Http\Controllers;

use App\Helpers\Helper;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');

        $query = Product::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        $query->when($request->has('category_ids') && $request->category_ids, function ($row) use ($request) {
            $row->whereIn('category_id', explode(',', $request->category_ids));
        });

        $query->when($request->has('limited_stock') && $request->limited_stock, function ($row) use ($request) {
            $row->where('limited_stock', $request->limited_stock);
        });

        $products = $query->with('category')->orderBy('id', 'desc')->paginate(10)->withQueryString();
        $categories = Category::select('id', 'name')->get();
        return Inertia::render('Product/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        $categories = Category::select('id', 'name')->get();
        return Inertia('Product/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required'],
            'description' => ['nullable'],
            'price' => ['required'],
            'category_id' => ['required', Rule::exists('categories', 'id')],
            'origin' => ['required'],
            'abv' => ['required'],
            'volume' => ['required'],
            'measurement' => ['nullable'],
            'limited_stock' => ['required', 'between:0,1'],
            'productImages' => ['array'],
            'productImages.*.image_url' => ['file', 'mimes:jpeg,jpg,png', 'max:2048'],
        ], [
            'name.required' => 'Nama produk diperlukan',
            'price.required' => 'Harga produk diperlukan',
            'category_id.required' => 'Kategori produk diperlukan',
            'origin.required' => 'Asal produk diperlukan',
            'volume.required' => 'Volume diperlukan',
            'abv.required' => 'Persentase alkohol diperlukan',
            'measurement' => 'Satuan diperlukan',
            'limited_stock.required' => 'Tipe stok diperlukan',
            'productImages.*.image_url.file' => 'Gambar dibutuhkan',
            'productImages.*.image_url.mimes' => 'Tipe gambar tidak valid. Hanya menerima: jpeg,jpg,png',
            'productImages.*.image_url.max' => 'Gambar maksimal 2MB',
        ]);

        $validator->after(function ($validator) use ($request) {
            $images = $request->input('productImages', []);
            $hasThumbnail = collect($images)->contains(function ($img) {
                return !empty($img['is_thumbnail']);
            });
            if (!$hasThumbnail) {
                $validator->errors()->add('productImages', 'Minimal satu gambar harus dijadikan thumbnail.');
            }
        });

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $product = Product::create($request->except('productImages'));

        if ($request->has('productImages')) {
            foreach ($request->productImages as $image) {
                $file = $image['image_url'];
                $path = $file->store('products', 'public');
                $url = asset('storage/' . $path);
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $url,
                    'is_thumbnail' => $image['is_thumbnail']
                ]);
            }
        }

        return redirect()->route('products.index')->with('success', 'Produk Berhasil Ditambahkan!');
    }

    public function show(int $id)
    {
        $product = Product::with('category', 'productImages')->find($id);
        $categories = Category::select('id', 'name')->get();
        return Inertia::render('Product/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required'],
            'description' => ['nullable'],
            'price' => ['required'],
            'category_id' => ['required', Rule::exists('categories', 'id')],
            'origin' => ['required'],
            'abv' => ['required'],
            'volume' => ['required'],
            'measurement' => ['nullable'],
            'limited_stock' => ['required', 'between:0,1'],
            'productImages' => ['array'],
            'productImages.*.image_url' => [
                function ($attribute, $value, $fail) {
                    if ($value instanceof UploadedFile) {
                        $allowed = ['image/jpeg', 'image/jpg', 'image/png'];
                        if (!in_array($value->getMimeType(), $allowed)) {
                            $fail('Tipe gambar tidak valid. Hanya menerima: jpeg,jpg,png');
                        }
                        if ($value->getSize() > 2 * 1024 * 1024) {
                            $fail('Gambar maksimal 2MB');
                        }
                    }
                }
            ],
        ], [
            'name.required' => 'Nama produk diperlukan',
            'price.required' => 'Harga produk diperlukan',
            'category_id.required' => 'Kategori produk diperlukan',
            'origin.required' => 'Asal produk diperlukan',
            'volume.required' => 'Volume diperlukan',
            'abv.required' => 'Persentase alkohol diperlukan',
            'measurement' => 'Satuan diperlukan',
            'limited_stock.required' => 'Tipe stok diperlukan',
        ]);

        $validator->after(function ($validator) use ($request) {
            $images = $request->input('productImages', []);
            $hasThumbnail = collect($images)->contains(fn($img) => !empty($img['is_thumbnail']));
            if (!$hasThumbnail) {
                $validator->errors()->add('productImages', 'Minimal satu gambar harus dijadikan thumbnail.');
            }
        });

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $product = Product::findOrFail($id);

        if ($request->has('productImages')) {
            foreach ($request->productImages as $image) {
                $isThumbnail = !empty($image['is_thumbnail']) && $image['is_thumbnail'] === '1';

                if ($image['image_url'] instanceof UploadedFile) {
                    $path = $image['image_url']->store('products', 'public');
                    $url = asset('storage/' . $path);

                    if (!empty($image['id'])) {
                        $productImage = ProductImage::find($image['id']);
                        if ($productImage) {
                            Helper::deleteImage($productImage->image_url);
                            $productImage->update([
                                'image_url' => $url,
                                'is_thumbnail' => $isThumbnail
                            ]);
                        }
                    } else {
                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_url' => $url,
                            'is_thumbnail' => $isThumbnail
                        ]);
                    }
                } elseif (!empty($image['id'])) {
                    $productImage = ProductImage::find($image['id']);
                    if ($productImage) {
                        if (!empty($image['is_deleted'])) {
                            Helper::deleteImage($productImage->image_url);
                            $productImage->delete();
                        } else {
                            $productImage->update(['is_thumbnail' => $isThumbnail]);
                        }
                    }
                }
            }
        }

        $product->update($request->except('productImages'));

        return Inertia::render('Product/Edit', [
            'product' => Product::with('category', 'productImages')->find($id),
            'categories' => Category::all(),
            'flash' => ['success' => 'Produk Berhasil Dirubah!'],
        ]);
    }

    public function destroy(int $id)
    {
        $product = Product::where('id', $id)->first();
        foreach($product->productImages()->get() as $img) {
            Helper::deleteImage($img->image_url);
            $img->delete();
        }
        $product->delete();
        return redirect()->back()->with('success', 'Produk Berhasil Dihapus!');
    }
}
