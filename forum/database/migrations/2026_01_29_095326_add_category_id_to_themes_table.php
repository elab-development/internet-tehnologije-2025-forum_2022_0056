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
        Schema::table('themes', function (Blueprint $table) {
            // Dodajte kolonu category_id
            $table->foreignId('category_id')
                ->nullable() // Dozvoli null vrednosti
                ->constrained('categories') // Poveži sa categories tabelom
                ->nullOnDelete(); // Kada se kategorija obriše, postavi na null
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('themes', function (Blueprint $table) {
            // Ukloni foreign key i kolonu
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
    }
};