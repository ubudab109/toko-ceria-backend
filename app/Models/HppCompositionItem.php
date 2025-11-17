<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HppCompositionItem extends Model
{
    protected $fillable = [
        'hpp_composition_id',
        'hpp_category_id',
        'inventory_id',
        'stock_used',
        'total_price_inventory',
    ];

    protected $appends = ['category_name'];

    public function getCategoryNameAttribute()
    {
        return $this->hppCategory->category_name;
    }
    
    public function hppComposition()
    {
        return $this->belongsTo(HppComposition::class, 'hpp_composition_id', 'id');
    }

    public function hppCategory()
    {
        return $this->belongsTo(HppCompositionCategory::class, 'hpp_category_id', 'id');
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id', 'id');
    }
}
