<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DataExportController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;

Route::middleware(['auth'])->group(function () {
    Route::get('/', fn() => Inertia::render('Welcome', [
        'title' => 'Welcome Page',
    ]))->name('dashboard');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::resource('categories', CategoryController::class)->names('categories');
    // Route::resource('products', ProductController::class)->names('products');
    // Route::get('')
    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::post('products', [ProductController::class, 'store'])->name('products.store');
    Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('products/{id}', [ProductController::class, 'update'])->name('products.update');
    Route::get('products/{id}', [ProductController::class, 'show'])->name('products.show');
    Route::delete('products/{id}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::resource('inventories', InventoryController::class)->names('inventories');
    Route::put('adjust-stock-inventory/{id}', [InventoryController::class, 'adjustStock'])->name('inventory.adjust-stock');
    Route::post('generate-inventory-sku', [InventoryController::class, 'generateSku'])->name('generate.sku');
    Route::resource('customers', CustomerController::class)->names('customers');
    Route::resource('orders', OrderController::class)->names('orders');
    Route::post('export-orders', [OrderController::class, 'exportOrders'])->name('export.orders');
    Route::post('generate-order-number', [OrderController::class, 'generateOrderNumber'])
        ->name('generate.order-number');
    Route::resource('data-exports', DataExportController::class)->names('data-exports');
    Route::put('read-notification/{id}', [NotificationController::class, 'read'])->name('read.notification');
    Route::put('read-notification-all', [NotificationController::class, 'readAll'])->name('read.notification-all');
});

Route::middleware(['guest'])->group(function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'loginProcess'])->name('login.process');
});
