<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HppComposition extends Model
{
    protected $fillable = ['inventory_id', 'labor_cost', 'production_batch'];
    protected $appends = ['total'];

    public function getTotalAttribute()
    {
        return $this->hppItems()->sum('total_price_inventory');
    }
    
    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id', 'id');
    }

    public function hppCategories()
    {
        return $this->hasMany(HppCompositionCategory::class, 'hpp_composition_id', 'id');
    }

    public function hppItems()
    {
        return $this->hasMany(HppCompositionItem::class, 'hpp_composition_id', 'id');
    }
}
