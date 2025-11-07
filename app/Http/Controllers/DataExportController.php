<?php

namespace App\Http\Controllers;

use App\Models\DataExport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DataExportController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $query = DataExport::query();

        if ($search) {
            $query->where('export_type', 'lik', "%{$search}%");
        }

        if ($request->has('statuses') && !empty($request->statuses)) {
            $query->whereIn('status', explode(',', $request->statuses));
        }

        $dataExports = $query
        ->orderBy('id', 'desc')
        ->paginate(10)
        ->withQueryString();

        return Inertia::render('DataExports/Index', [
            'dataExports' => $dataExports,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }
}
