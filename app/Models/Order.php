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
        'created_at'
    ];

    protected $appends = ['total_product_ordered', 'badgeStatus', 'margins'];

    public function getMarginsAttribute()
    {
        $data = [];
        foreach ($this->productOrders as $po) {
            $hppComposition = $po->product->inventory->hppCompositions;
            if ($hppComposition) {
                $totalHppPrice = $hppComposition->total * $po->quantity;
                $data[] = [
                    'product_name' => $po->product->name,
                    'hpp_price' => $hppComposition->total,
                    'total_hpp_price' => $totalHppPrice,
                    'product_price' => $po->product->price,
                    'order_quantity' => $po->quantity,
                    'margin_profit' => ($po->quantity * $po->product->price) - $totalHppPrice
                ];
            }
        };
        return $data;
    }

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
