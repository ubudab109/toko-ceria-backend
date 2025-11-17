<?php

namespace App\Http\Controllers;

use App\Constants\OrderStatus;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard(Request $request)
    {
        $dailySales = Order::whereDate('created_at', Carbon::today())
            ->where('status', OrderStatus::PAID()->getValue())
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->get();

        $currentMonth = now()->month;
        $currentYear = now()->year;

        $start = Carbon::create($currentYear, $currentMonth, 1);
        $end = $start->copy()->endOfMonth();

        // Ambil data penjualan
        $sales = Order::whereBetween('created_at', [$start, $end])
            ->where('status', OrderStatus::PAID()->getValue())
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        // Buat semua tanggal bulan ini
        $data = collect();
        $cursor = $start->copy();

        while ($cursor->lte($end)) {
            $date = $cursor->toDateString();
            $data->push([
                'date' => $date,
                'total' => $sales[$date] ?? 0
            ]);
            $cursor->addDay();
        }

        $monthlySales = $data->values();

        $range = $request->input('date_range', [
            'start' => now()->subMonth()->toDateString(),
            'end' => now()->toDateString(),
        ]);

        $filteredSales = Order::whereBetween('created_at', [$range['start'], $range['end']])
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->where('status', OrderStatus::PAID()->getValue())
            ->groupBy('date')
            ->get();
        Log::info('filteredSales', $filteredSales->toArray());
        return Inertia::render('Welcome', [
            'title' => 'Dashboard',
            'dailySales' => $dailySales,
            'monthlySales' => $monthlySales,
            'filteredSales' => $filteredSales,
            'filters' => [
                'start' => $range['start'],
                'end' => $range['end']
            ]
        ]);
    }
}
