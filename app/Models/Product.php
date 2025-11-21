<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'category_id',
        'origin',
        'abv',
        'volume',
        'measurement',
        'limited_stock',
        'image',
        'is_public'
    ];

    protected $appends = ['stock', 'thumbnail'];

    protected $casts = [
        'price' => 'float',
        'is_public' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            $product->slug = self::generateUniqueSlug($product->name);
        });

        static::updating(function ($product) {
            if ($product->isDirty('name')) {
                $product->slug = self::generateUniqueSlug($product->name, $product->id);
            }
        });
    }

    /**
     * Generate unique slug for product name
     */
    private static function generateUniqueSlug(string $name, $ignoreId = null): string
    {
        $baseSlug = Str::slug($name); // ex: "Product Two" -> "product-two"
        $slug = $baseSlug;
        $counter = 1;
        while (self::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    public function getThumbnailAttribute()
    {
        $data = $this->productImages()->where('is_thumbnail', true)->first();
        return $data;
    }

    public function getStockAttribute()
    {
        if ($inventory = $this->inventory()->first()) {
            return $inventory->stock;
        }
        return 0;
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function productImages()
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'id');
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class, 'product_id', 'id');
    }

    public function productOrders()
    {
        return $this->hasMany(ProductOrder::class, 'product_id', 'id');
    }
}
