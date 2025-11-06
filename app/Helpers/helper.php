<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Helper
{
    public static function deleteImage(string $fullUrl): void
    {
        $relativePath = Str::after($fullUrl, asset('storage') . '/');
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        } else {
            Log::info('Image not found');
        }
    }

    public static function rupiahFormat(int $amount): string
    {
        return 'Rp ' . number_format($amount, 0, ',', '.');
    }
}