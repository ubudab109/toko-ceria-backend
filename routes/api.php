<?php

use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


Route::get('products/all', [ProductController::class, 'index'])->name('products.all');
Route::get('products/detail/{slug}', [ProductController::class, 'show'])->name('products.detail');
Route::post('checkout-order', [CheckoutController::class, 'checkout'])->name('checkout');
Route::get('checkout-order', [CheckoutController::class, 'getDetailCheckout'])->name('detail-checkout');
