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

        // --- OUTCOME DATA ---
        $outcomeToday = \App\Models\Outcome::whereDate('created_at', Carbon::today())->sum('total');
        $outcomeThisMonth = \App\Models\Outcome::whereMonth('created_at', $currentMonth)->whereYear('created_at', $currentYear)->sum('total');

        // Daily Outcomes (Today)
        $dailyOutcomes = \App\Models\Outcome::whereDate('created_at', Carbon::today())
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->get();

        // Monthly Outcomes (This Month)
        $outcomeSalesData = \App\Models\Outcome::whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        $monthlyOutcomesData = collect();
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $date = $cursor->toDateString();
            $monthlyOutcomesData->push([
                'date' => $date,
                'total' => $outcomeSalesData[$date] ?? 0
            ]);
            $cursor->addDay();
        }
        $monthlyOutcomes = $monthlyOutcomesData->values();

        // Filtered Outcomes
        $filteredOutcomes = \App\Models\Outcome::whereBetween('created_at', [$range['start'], $range['end']])
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->get();


        // --- PROFIT MARGIN DATA ---
        // Profit Today
        $ordersToday = Order::whereDate('created_at', Carbon::today())
            ->where('status', OrderStatus::PAID()->getValue())
            ->get();
        $profitToday = 0;
        foreach ($ordersToday as $order) {
            foreach ($order->margins as $margin) {
                $profitToday += $margin['margin_profit'];
            }
        }

        // Profit This Month
        $ordersThisMonth = Order::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->where('status', OrderStatus::PAID()->getValue())
            ->get();
        $profitThisMonth = 0;
        foreach ($ordersThisMonth as $order) {
            foreach ($order->margins as $margin) {
                $profitThisMonth += $margin['margin_profit'];
            }
        }

        // Daily Profit (Today) - Chart
        // Note: This is tricky with getMarginsAttribute. We'll approximate or do it in PHP.
        // For chart "Today", it's just one bar if grouped by date. But if we want hourly... existing SalesChart uses daily.
        // So "Daily Profit" chart for today will just be 1 bar? SalesChart "Daily" is actually "Today's sales".
        // Let's stick to the pattern.
        $dailyProfit = collect([
            ['date' => Carbon::today()->toDateString(), 'total' => $profitToday]
        ]);

        // Monthly Profit (This Month) - Chart
        // We need to iterate all orders this month and group by date.
        $monthlyProfitData = [];
        foreach ($ordersThisMonth as $order) {
            $date = $order->created_at->toDateString();
            if (!isset($monthlyProfitData[$date])) $monthlyProfitData[$date] = 0;
            foreach ($order->margins as $margin) {
                $monthlyProfitData[$date] += $margin['margin_profit'];
            }
        }
        $monthlyProfitChart = collect();
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $date = $cursor->toDateString();
            $monthlyProfitChart->push([
                'date' => $date,
                'total' => $monthlyProfitData[$date] ?? 0
            ]);
            $cursor->addDay();
        }
        $monthlyProfit = $monthlyProfitChart->values();

        // Filtered Profit
        $ordersFiltered = Order::whereBetween('created_at', [$range['start'], $range['end']])
            ->where('status', OrderStatus::PAID()->getValue())
            ->get();
        $filteredProfitData = [];
        foreach ($ordersFiltered as $order) {
            $date = $order->created_at->toDateString();
            if (!isset($filteredProfitData[$date])) $filteredProfitData[$date] = 0;
            foreach ($order->margins as $margin) {
                $filteredProfitData[$date] += $margin['margin_profit'];
            }
        }
        // For filtered, we usually just show the days that have data or full range?
        // SalesChart filtered uses the query result directly.
        $filteredProfit = collect();
        // To match SalesChart format (array of objects), we transform the array.
        // But better to fill gaps if we want a nice line chart.
        // Let's just return the data points present for now to save performance, or fill gaps if range is small.
        // User asked for "default 1 month".
        // Let's fill gaps for the range.
        $fStart = Carbon::parse($range['start']);
        $fEnd = Carbon::parse($range['end']);
        $fCursor = $fStart->copy();
        while ($fCursor->lte($fEnd)) {
            $date = $fCursor->toDateString();
            $filteredProfit->push([
                'date' => $date,
                'total' => $filteredProfitData[$date] ?? 0
            ]);
            $fCursor->addDay();
        }


        $totalOrdersToday = $ordersToday->count();
        $newCustomersToday = \App\Models\Customer::whereDate('created_at', Carbon::today())->count();
        $pettyCash = \App\Models\CompanyAsset::where('name', 'petty_cash')->value('value');

        return Inertia::render('Welcome', [
            'title' => 'Dashboard',
            'dailySales' => $dailySales,
            'monthlySales' => $monthlySales,
            'filteredSales' => $filteredSales,
            'filters' => [
                'start' => $range['start'],
                'end' => $range['end']
            ],
            'stats' => [
                'pettyCash' => $pettyCash,
                'profitToday' => $profitToday,
                'totalOrdersToday' => $totalOrdersToday,
                'newCustomersToday' => $newCustomersToday
            ],
            'outcomes' => [
                'today' => $outcomeToday,
                'thisMonth' => $outcomeThisMonth,
                'daily' => $dailyOutcomes,
                'monthly' => $monthlyOutcomes,
                'filtered' => $filteredOutcomes
            ],
            'profits' => [
                'today' => $profitToday,
                'thisMonth' => $profitThisMonth,
                'daily' => $dailyProfit,
                'monthly' => $monthlyProfit,
                'filtered' => $filteredProfit
            ]
        ]);
    }
}
