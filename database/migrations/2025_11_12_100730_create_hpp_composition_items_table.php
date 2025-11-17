<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hpp_composition_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hpp_composition_id')->constrained('hpp_compositions')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('hpp_category_id')->constrained('hpp_composition_categories')
            ->onDelete('cascade')
            ->onUpdate('cascade');
            $table->foreignId('inventory_id')->constrained('inventories')
            ->onDelete('cascade')
            ->onUpdate('cascade');
            $table->double('total_price_inventory')->default(0);
            $table->double('stock_used')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hpp_composition_items');
    }
};
