<?php

namespace App\Jobs;

use App\Constants\InventoryHistoryType;
use App\Http\Services\NotificationService;
use App\Models\HppBatchHistory;
use App\Models\HppComposition;
use App\Models\Inventory;
use App\Traits\InventoryHistoryTrait;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductionBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, InventoryHistoryTrait;

    protected $hppComposition, $userId;
    protected int $requestedBatches;
    /**
     * Create a new job instance.
     */
    public function __construct(HppComposition $hppComposition, int $requestedBatches, int $userId)
    {
        $this->hppComposition = $hppComposition;
        $this->requestedBatches = $requestedBatches;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Load items with inventory
        $productionPerBatch = (int) $this->hppComposition->production_batch;
        $hppItems = $this->hppComposition->hppItems()->with('inventory')->get();

        if ($hppItems->isEmpty() || $productionPerBatch <= 0 || $this->requestedBatches <= 0) {
            NotificationService::sendNotification([
                'title' => 'Produksi Gagal',
                'description' => 'Tidak ada item HPP atau konfigurasi produksi invalid.',
                'link' => route('hpp-compositions.show', $this->hppComposition->id),
            ]);
            return;
        }

        // 1) Hitung usage per inventory per 1 batch (sum stock_used untuk inventory yang sama)
        $usagePerInventory = []; // inventory_id => sum(stock_used)
        foreach ($hppItems as $item) {
            $invId = $item->inventory_id;
            $usagePerInventory[$invId] = ($usagePerInventory[$invId] ?? 0) + (float)$item->stock_used;
        }

        // 2) Hitung max batches possible berdasarkan stok sekarang
        $maxBatchesPossible = PHP_INT_MAX;
        $inventoryRecords = Inventory::whereIn('id', array_keys($usagePerInventory))->get()->keyBy('id');

        foreach ($usagePerInventory as $invId => $usagePerBatch) {
            $inventory = $inventoryRecords->get($invId);
            if (!$inventory) {
                // inventory hilang atau tidak ditemukan -> nol possible
                $maxBatchesPossible = 0;
                break;
            }

            // kebutuhan per batch untuk inventory ini = usagePerBatch * productionPerBatch
            $needPerBatch = $usagePerBatch * $productionPerBatch;

            if ($needPerBatch <= 0) {
                // kalau needPerBatch 0, ignore (tidak mengkonsumsi)
                continue;
            }

            // maksimum batch yang bisa dipenuhi oleh inventory itu
            $possible = (int) floor($inventory->stock / $needPerBatch);
            if ($possible < $maxBatchesPossible) {
                $maxBatchesPossible = $possible;
            }
        }

        // 3) Tentukan berapa batch yang akan diproses
        $processedBatches = min($this->requestedBatches, $maxBatchesPossible);

        if ($processedBatches <= 0) {
            // Tidak bisa memproses satupun batch
            $maxPossible = max(0, $maxBatchesPossible === PHP_INT_MAX ? 0 : $maxBatchesPossible);
            NotificationService::sendNotification([
                'title' => 'Produksi Gagal - Stok Tidak Cukup',
                'description' => "Produksi batch tidak dapat dilakukan. Batch maksimal yang dapat diproses: {$maxPossible}.",
                'link' => route('hpp-compositions.show', $this->hppComposition->id),
            ]);
            return;
        }

        // 4) Hitung total deduction per inventory: usagePerBatch * productionPerBatch * processedBatches
        $totalDeductionPerInventory = [];
        foreach ($usagePerInventory as $invId => $usagePerBatch) {
            $needPerBatch = $usagePerBatch * $productionPerBatch;
            $totalDeductionPerInventory[$invId] = $needPerBatch * $processedBatches;
        }

        // 5) Lakukan pengurangan stok sekaligus dalam transaction
        DB::transaction(function () use ($totalDeductionPerInventory, $hppItems, $productionPerBatch, $processedBatches) {
            // Decrement per inventory, buat history per inventory
            foreach ($totalDeductionPerInventory as $invId => $qty) {
                if ($qty <= 0) continue;
                $inventory = Inventory::lockForUpdate()->find($invId); // lock row
                if (!$inventory) continue;

                // decrement stock
                $inventory->decrement('stock', $qty);

                // create inventory history (sesuaikan fields dengan model / trait)
                $currentInventory = Inventory::find($invId);
                $message = "Terjadi pengurangan stok sebesar {$qty}";
                $dataHistory = [
                    'description' => "{$message}: Pengurangan stok untuk produksi {$processedBatches} batch dari komposisi HPP ID {$this->hppComposition->id}",
                    'stock' => $currentInventory->stock - $qty,
                ];
                $this->storeHistories($currentInventory, $dataHistory, $this->userId, InventoryHistoryType::STOCK_ADJUSMENT()->getValue());
            }

            // Simpan hpp batch history (satu record untuk keseluruhan processedBatches)
            HppBatchHistory::create([
                'hpp_composition_id' => $this->hppComposition->id,
                'user_id' => $this->userId,
                'total_batch' => $processedBatches,
            ]);
        });

        // 6) Kirim notifikasi untuk setiap item (memberi tahu berapa stock yang dikurangi untuk tiap item)
        // totalReducedPerItem = item.stock_used * productionPerBatch * processedBatches
        foreach ($hppItems as $item) {
            $totalReduced = (float)$item->stock_used * $productionPerBatch * $processedBatches;
            NotificationService::sendNotification([
                'title' => 'Stok Dikurangi untuk Item HPP',
                'description' => "Inventory: {$item->inventory->name}. Dikurangi sebanyak: {$totalReduced}. (Komposisi: HPP ID {$this->hppComposition->id})",
                'link' => route('inventories.show', $item->inventory->id),
            ]);
        }

        // ADD PRODUK INVENTORY
        $totalAddedFromBatch = $processedBatches * $this->hppComposition->production_batch;

        $productInventory = Inventory::where('id', $this->hppComposition->inventory_id);

        $productInventory->increment('stock', $totalAddedFromBatch);
        $productInventoryData = $productInventory->first();
        $dataMessageProductLog = [
            'description' => "Terjadi penambahan stok sebesar {$totalAddedFromBatch}: Penambahan stok dari proses batch (HPP ID: {$this->hppComposition->id})",
            'stock' => $productInventoryData->stock + $totalAddedFromBatch,
        ];

        $this->storeHistories($productInventory->first(), $dataMessageProductLog, $this->userId, InventoryHistoryType::STOCK_ADJUSMENT()->getValue());
        NotificationService::sendNotification([
            'title' => "Penambahan Stok produk {$productInventoryData->name}",
            'description' => "Penambahan stok sebesar {$totalAddedFromBatch} dari proses batch (HPP ID: {$this->hppComposition->id})",
            'link' => route('inventories.show', $productInventoryData->id),
        ]);
        // 7) Ringkasan notifikasi: penuh atau sebagian
        if ($processedBatches === $this->requestedBatches) {
            NotificationService::sendNotification([
                'title' => 'Produksi Batch Selesai',
                'description' => "{$processedBatches} batch berhasil diproses dari permintaan {$this->requestedBatches}.",
                'link' => route('hpp-compositions.show', $this->hppComposition->id),
            ]);
        } else {
            NotificationService::sendNotification([
                'title' => 'Produksi Batch Selesai Sebagian',
                'description' => "{$processedBatches} batch berhasil diproses dari permintaan {$this->requestedBatches}. Stok tidak mencukupi untuk sisa batch.",
                'link' => route('hpp-compositions.show', $this->hppComposition->id),
            ]);
        }
    }
}
