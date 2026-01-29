<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Theme;
use Illuminate\Database\Seeder;

class ThemeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pronađi kategorije
        $destinacijeCategory = Category::where('slug', 'planinarske-destinacije')->first();
        $pocetniciCategory = Category::where('slug', 'planinarstvo')->first();
        $kampovanjeCategory = Category::where('slug', 'kampovanje')->first();
        $obukaCategory = Category::where('slug', 'obuka-i-edukacija')->first();
        $opsteCategory = Category::where('slug', 'opste')->first();

        $themes = [
            // ==================== PLANINARSKE DESTINACIJE ====================
            [
                'name' => 'Kopaonik',
                'description' => 'Najveća planina u Srbiji, izletište i skijalište. Diskutujte o stazama, smeštaju i iskustvima.',
                'category_id' => $destinacijeCategory->id,
                'location_name' => 'Kopaonik, Srbija',
                'latitude' => 43.2850,
                'longitude' => 20.8144,
            ],
            [
                'name' => 'Tara',
                'description' => 'Planina sa najvećom koncentracijom četinskih šuma u Evropi, Nacionalni park.',
                'category_id' => $destinacijeCategory->id,
                'location_name' => 'Tara, Srbija',
                'latitude' => 43.8932,
                'longitude' => 19.4545,
            ],
            [
                'name' => 'Zlatibor',
                'description' => 'Popularno turističko i planinarsko odredište sa brojnim stazama i izletištima.',
                'category_id' => $destinacijeCategory->id,
                'location_name' => 'Zlatibor, Srbija',
                'latitude' => 43.7260,
                'longitude' => 19.7004,
            ],
            [
                'name' => 'Fruška Gora',
                'description' => 'Najstariji nacionalni park u Srbiji, poznat po manastirima i šetnim stazama.',
                'category_id' => $destinacijeCategory->id,
                'location_name' => 'Fruška Gora, Srbija',
                'latitude' => 45.1500,
                'longitude' => 19.7167,
            ],
            [
                'name' => 'Stara Planina',
                'description' => 'Najduža planina na Balkanu, poznata po Babin Zubu i Midžoru.',
                'category_id' => $destinacijeCategory->id,
                'location_name' => 'Stara Planina, Srbija/Bugarska',
                'latitude' => 43.4167,
                'longitude' => 22.6667,
            ],

            // ==================== PLANINARSTVO ZA POČETNIKE ====================
            [
                'name' => 'Osnovna oprema',
                'description' => 'Šta je neophodno za početak? Diskusije o cipeLAMA, rančevima, štapovima i ostaloj opremi.',
                'category_id' => $pocetniciCategory->id,
                'location_name' => 'Beograd, Srbija',
                'latitude' => 44.7866,
                'longitude' => 20.4489,
            ],
            [
                'name' => 'Prvi izleti',
                'description' => 'Preporuke za lake staze za početnike, sigurnost i priprema.',
                'category_id' => $pocetniciCategory->id,
                'location_name' => 'Avala, Srbija',
                'latitude' => 44.6889,
                'longitude' => 20.5142,
            ],
            [
                'name' => 'Planinarski klubovi',
                'description' => 'Preporuke i iskustva sa planinarskim klubovima, organizovanim izletima.',
                'category_id' => $pocetniciCategory->id,
                'location_name' => 'Novi Sad, Srbija',
                'latitude' => 45.2551,
                'longitude' => 19.8449,
            ],
            [
                'name' => 'Zdravlje i kondicija',
                'description' => 'Kako se pripremiti fizički, šta jesti i piti na planini, prva pomoć.',
                'category_id' => $pocetniciCategory->id,
                'location_name' => 'Niš, Srbija',
                'latitude' => 43.3209,
                'longitude' => 21.8958,
            ],

            // ==================== KAMPOVANJE ====================
            [
                'name' => 'Divlje kampovanje',
                'description' => 'Pravila, dozvole, iskustva i preporuke za kampovanje u prirodi.',
                'category_id' => $kampovanjeCategory->id,
                'location_name' => 'Đerdap, Srbija',
                'latitude' => 44.6667,
                'longitude' => 22.5333,
            ],
            [
                'name' => 'Kamp oprema',
                'description' => 'Šatori, vreće za spavanje, kuhinjska oprema i ostalo za kampovanje.',
                'category_id' => $kampovanjeCategory->id,
                'location_name' => 'Užice, Srbija',
                'latitude' => 43.8556,
                'longitude' => 19.8425,
            ],
            [
                'name' => 'Kampovi i autokampovi',
                'description' => 'Preporuke za organizovane kampove u Srbiji i regionu.',
                'category_id' => $kampovanjeCategory->id,
                'location_name' => 'Vrnjačka Banja, Srbija',
                'latitude' => 43.6250,
                'longitude' => 20.8964,
            ],
            [
                'name' => 'Preživljavanje',
                'description' => 'Vještine preživljavanja u prirodi, alatke i oprema.',
                'category_id' => $kampovanjeCategory->id,
                'location_name' => 'Zaječar, Srbija',
                'latitude' => 43.9036,
                'longitude' => 22.2647,
            ],

            // ==================== OBUKA I EDUKACIJA ====================
            [
                'name' => 'Kursevi i radionice',
                'description' => 'Informacije o planinarskim kursevima, obukama i radionicama.',
                'category_id' => $obukaCategory->id,
                'location_name' => 'Subotica, Srbija',
                'latitude' => 46.1000,
                'longitude' => 19.6667,
            ],
            [
                'name' => 'Orijentacija',
                'description' => 'Korišćenje kompasa, mapa, GPS uređaja i orijentacija u prirodi.',
                'category_id' => $obukaCategory->id,
                'location_name' => 'Kragujevac, Srbija',
                'latitude' => 44.0128,
                'longitude' => 20.9114,
            ],
            [
                'name' => 'Vremenske prilike',
                'description' => 'Kako pročitati vremensku prognozu, opasnosti povezane sa vremenom.',
                'category_id' => $obukaCategory->id,
                'location_name' => 'Zrenjanin, Srbija',
                'latitude' => 45.3816,
                'longitude' => 20.3685,
            ],
            [
                'name' => 'Zaštita prirode',
                'description' => 'Etički kodeks planinara, zaštita životne sredine, leave no trace.',
                'category_id' => $obukaCategory->id,
                'location_name' => 'Smederevo, Srbija',
                'latitude' => 44.6659,
                'longitude' => 20.9336,
            ],

            // ==================== OPŠTE ====================
            [
                'name' => 'Dogadjaji i skupovi',
                'description' => 'Planinarski događaji, skupovi, manifestacije i takmičenja.',
                'category_id' => $opsteCategory->id,
                'location_name' => 'Pančevo, Srbija',
                'latitude' => 44.8708,
                'longitude' => 20.6403,
            ],
            [
                'name' => 'Planinarske priče',
                'description' => 'Podelite svoja iskustva, priče i anegdote sa planina.',
                'category_id' => $opsteCategory->id,
                'location_name' => 'Šabac, Srbija',
                'latitude' => 44.7538,
                'longitude' => 19.6875,
            ],
            [
                'name' => 'Fotografija',
                'description' => 'Planinarska fotografija, saveti za snimanje u prirodi.',
                'category_id' => $opsteCategory->id,
                'location_name' => 'Čačak, Srbija',
                'latitude' => 43.8914,
                'longitude' => 20.3497,
            ],
            [
                'name' => 'Pozdrav i upoznavanje',
                'description' => 'Upoznajte se sa drugim planinarima, predstavite se.',
                'category_id' => $opsteCategory->id,
                'location_name' => 'Leskovac, Srbija',
                'latitude' => 42.9976,
                'longitude' => 21.9447,
            ],
        ];

        foreach ($themes as $theme) {
            Theme::firstOrCreate(
                ['name' => $theme['name']],
                $theme
            );
        }

        $this->command->info('Teme su uspešno kreirane! Ukupno: ' . count($themes) . ' tema.');
    }
}