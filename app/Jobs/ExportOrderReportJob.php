<?php

namespace App\Jobs;

use App\Models\DataExport;
use App\Models\Order;
use App\Exports\OrderExport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class ExportOrderReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $exportRecord;

    public function __construct(DataExport $exportRecord)
    {
        $this->exportRecord = $exportRecord;
    }


    public function handle(): void
    {
        $this->exportRecord->update(['status' => 'processing']);

        try {
            $filters = $this->exportRecord->filters ?? [];
            $dateStart = $filters['date_start'] ?? null;
            $dateEnd = $filters['date_end'] ?? null;
            $statuses = $filters['status'] ?? [];

            $query = Order::with(['customer', 'productOrders.product.inventory'])
                ->when(
                    $dateStart && $dateEnd,
                    fn($q) =>
                    $q->whereBetween('created_at', [$dateStart, $dateEnd])
                )
                ->when(
                    !empty($statuses),
                    fn($q) =>
                    $q->whereIn('status', $statuses)
                );
            $orders = $query->get();
            // ->map(function ($order) {
            //     return [
            //         'order_number' => $order->order_number,
            //         'total' => $order->total,
            //         'checkout_type' => $order->checkout_type,
            //         'status' => $order->status,
            //         'created_at' => $order->created_at->format('d-m-Y H:i'),
            //         'customer_name' => $order->customer?->name ?? '-',
            //         'products' => $order->productOrders->map(function ($po) {
            //             return [
            //                 'name' => $po->product?->name ?? '-',
            //                 'quantity' => $po->quantity,
            //             ];
            //         })->toArray(),
            //     ];
            // });
            $fileName = 'order_report_' . now()->format('Ymd_His') . '.xlsx';
            $filePath = 'exports/' . $fileName;
            Excel::store(new OrderExport($orders), $filePath, 'public');
            $fullUrl = url(Storage::url($filePath));

            $this->exportRecord->update([
                'status' => 'success',
                'file_path' => $fullUrl,
            ]);
        } catch (Throwable $e) {
            $this->exportRecord->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
