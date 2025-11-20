<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class PettyCashHistory extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'value',
        'before_balance',
        'description'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
