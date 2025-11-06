<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'fullname',
        'email',
        'phone_code',
        'phone_number',
        'age',
        'address',
        'know_from',
    ];

    protected $appends = ['total_order'];
    
    public function getTotalOrderAttribute()
    {
        return $this->orders()->count();
    }
    
    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id', 'id');
    }
}
