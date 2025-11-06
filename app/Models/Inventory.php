<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = [
        'name',
        'product_id',
        'price',
        'description',
        'sku',
        'stock',
        'measurement',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function inventoryHistories()
    {
        return $this->hasMany(InventoryHistory::class, 'inventory_id', 'id');
    }
}
