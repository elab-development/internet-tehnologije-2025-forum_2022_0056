<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Planinarske Destinacije',
                'slug' => 'planinarske-destinacije',
                'description' => 'Diskusije o planinarskim destinacijama, ruterima i iskustvima sa planina',
                'order' => 1,
            ],
            [
                'name' => 'Planinarstvo za pocetnike',
                'slug' => 'planinarstvo',
                'description' => 'Saveti za planinare, osnovna oprema, rute i iskustva sa planina',
                'order' => 2,
            ],
            [
                'name' => 'Kampovanje',
                'slug' => 'kampovanje',
                'description' => 'Kampovanje, prezivljavanje i outdoor aktivnosti',
                'order' => 3,
            ],
            [
                'name' => 'Obuka i Edukacija',
                'slug' => 'obuka-i-edukacija',
                'description' => 'Kursevi, saveti za učenje, edukativni sadržaj',
                'order' => 4,
            ],
            [
                'name' => 'Opšte',
                'slug' => 'opste',
                'description' => 'Opšte diskusije i razgovori o svemu',
                'order' => 5,
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']], // Provera po slug-u
                $category
            );
        }

        $this->command->info('Kategorije su uspešno kreirane!');
    }
}