<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Proveri da li admin već postoji
        if (!User::where('email', 'admin@forum.local')->exists()) {
            User::factory()->admin()->create([
                'name' => 'Forum Admin',
                'email' => 'admin@forum.local',
                'password' => Hash::make('password'),
                'can_publish' => true,
            ]);
        }

        // Proveri da li postoje korisnici
        if (User::count() < 25) {
            User::factory()->count(3)->moderator()->create();
            User::factory()->count(20)->create();
            User::factory()->count(3)->blockedFromPublishing()->create();
        }

        // Pokreni ostale seedere
        $this->call([
            CategorySeeder::class,
            ThemeSeeder::class,
            PostSeeder::class,
            LikeSeeder::class,
        ]);
    }
}
