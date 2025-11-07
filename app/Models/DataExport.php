<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataExport extends Model
{
    protected $fillable = [
        'export_type',
        'filters',
        'file_path',
        'status',
        'error_message',
    ];

    protected $casts = [
        'filters' => 'array',
    ];
}
