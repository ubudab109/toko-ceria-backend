<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HppBatchHistory extends Model
{
    protected $fillable = [
        'hpp_composition_id',
        'user_id',
        'total_batch'
    ];

    public function hppComposition()
    {
        return $this->belongsTo(HppComposition::class, 'hpp_composition_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    
}
