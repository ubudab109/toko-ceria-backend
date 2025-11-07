<?php

namespace App\Models;

use App\Constants\OrderStatus;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'customer_id',
        'total',
        'checkout_type',
        'status',
    ];

    protected $appends = ['total_product_ordered', 'badgeStatus'];

    public function getBadgeStatusAttribute()
    {
        return OrderStatus::getBadgeStatus($this->status);
    }

    public function getTotalProductOrderedAttribute()
    {
        return $this->productOrders()->count();
    }

    public function productOrders()
    {
        return $this->hasMany(ProductOrder::class, 'order_id', 'id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function customerName(): string
    {
        if ($customer = $this->customer) {
            return "{$customer->fullname} - {$customer->email}";
        } else {
            return '-';
        }
    }
}
