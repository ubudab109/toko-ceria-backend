<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')
            ->where('is_public', true)
            ->get();
        $categories = Category::pluck('name');
        return response()->json([
            'products' => $products,
            'categories' => array_merge(['Semua'], $categories->toArray())
        ]);
    }

    public function show(string $slug)
    {
        $product = Product::with('category', 'productImages')
            ->where('slug', $slug)
            ->first();

        if (!$product) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Data produk tidak ditemukan',
                'product' => null,
                'related_products' => null,
            ], 404);
        }
        if ($product->category_id) {
            $relatedProducts = Product::where('category_id', $product->category_id)
                ->whereNotIn('id', [$product->id])
                ->where('is_public', true)
                ->with('category', 'productImages')
                ->take(4)
                ->get();
        } else {
            $relatedProducts = Product::with('category', 'productImages')
                ->where('is_public', true)
                ->whereNotIn('id', [$product->id])
                ->take(4)
                ->get();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data produk ditemukan',
            'product' => $product,
            'related_products' => $relatedProducts,
        ], 200);
    }
}
