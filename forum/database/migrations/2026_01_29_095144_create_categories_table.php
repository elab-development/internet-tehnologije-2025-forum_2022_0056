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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Naziv kategorije
            $table->string('slug')->unique(); // URL-friendly naziv
            $table->text('description')->nullable(); // Opis kategorije
            $table->integer('order')->default(0); // Redosled prikaza
            $table->boolean('is_active')->default(true); // Da li je aktivna
            $table->timestamps(); // created_at i updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};