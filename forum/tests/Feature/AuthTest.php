<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test registracije korisnika
     */
    public function test_user_can_register()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Korisnik',
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => ['id', 'name', 'email'],
                     'access_token',
                     'token_type'
                 ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test Korisnik'
        ]);
    }

    /**
     * Test registracije sa već postojećim email-om
     */
    public function test_user_cannot_register_with_existing_email()
    {
        // Prvo kreiraj korisnika
        User::factory()->create([
            'email' => 'test@example.com'
        ]);

        // Pokušaj registraciju sa istim email-om
        $response = $this->postJson('/api/register', [
            'name' => 'Drugi Korisnik',
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    /**
     * Test registracije bez lozinke
     */
    public function test_user_cannot_register_without_password()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Korisnik',
            'email' => 'test@example.com',
            // password missing
        ]);

        $response->assertStatus(422);
    }

    /**
     * Test uspešnog logina
     */
    public function test_user_can_login()
    {
        // Prvo kreiraj korisnika
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123')
        ]);

        // Pokušaj login
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'access_token',
                     'token_type'
                 ]);
    }

    /**
     * Test logina sa pogrešnom lozinkom
     */
    public function test_user_cannot_login_with_wrong_password()
    {
        // Prvo kreiraj korisnika
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123')
        ]);

        // Pokušaj login sa pogrešnom lozinkom
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'message' => 'Wrong credentials'
                 ]);
    }

    /**
     * Test logina sa nepostojećim email-om
     */
    public function test_user_cannot_login_with_nonexistent_email()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nepostoji@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test logout-a
     */
    public function test_user_can_logout()
    {
        // Prvo kreiraj i loguj korisnika
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        // Pokušaj logout
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'You have successfully logged out.'
                 ]);
    }

    /**
     * Test logout-a bez tokena
     */
    public function test_user_cannot_logout_without_token()
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }
}