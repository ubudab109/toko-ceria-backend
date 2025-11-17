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
        Schema::create('hpp_composition_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hpp_composition_id')->constrained('hpp_compositions')->onDelete('cascade')->onUpdate('cascade');
            $table->string('category_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hpp_composition_categories');
    }
};
