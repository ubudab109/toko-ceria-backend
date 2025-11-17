<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HppCompositionCategory extends Model
{
    protected $fillable = [
        'hpp_composition_id',
        'category_name'
    ];

    public function hppComposition()
    {
        return $this->belongsTo(HppComposition::class, 'hpp_composition_id', 'id');
    }
}
