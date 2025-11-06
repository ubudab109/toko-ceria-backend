<?php

namespace App\Traits;

use App\Models\Inventory;
use Illuminate\Support\Facades\Auth;

trait InventoryHistoryTrait
{
    public static function storeHistories(Inventory $inventory, array $data, ?int $userId, string $type = 'perubahan')
    {
        $fields = [
            'name' => [
                'title' => 'Perubahan Nama Inventori',
                'description' => 'Terjadi perubahan nama inventori',
            ],
            'price' => [
                'title' => 'Perubahan Harga Inventori',
                'description' => 'Terjadi perubahan harga inventori',
            ],
            'sku' => [
                'title' => 'Perubahan Nomor SKU Inventori',
                'description' => 'Terjadi perubahan nomor SKU inventori',
            ],
            'stock' => [
                'title' => 'Perubahan Stok Inventori',
                'description' => 'Terjadi perubahan stok inventori',
            ],
        ];
        foreach ($fields as $field => $meta) {
            if (!array_key_exists($field, $data)) {
                continue;
            }

            $oldValue = $inventory->{$field};
            $newValue = $data[$field];

            if ($oldValue != $newValue) {
                $inventory->inventoryHistories()->create([
                    'user_id' => $userId ?? null,
                    'title' => $meta['title'],
                    'description' => $data['description'] ?? $meta['description'],
                    'type' => $type,
                    'previous_value' => $oldValue,
                    'current_value' => $newValue,
                ]);
            }
        }
    }
}
