<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Category;
use App\Models\Theme;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $admin;
    protected $category;

    protected function setUp(): void
    {
        parent::setUp();

        // Kreiramo test korisnike
        $this->user = User::factory()->create();
        $this->admin = User::factory()->admin()->create();
        
        // Kreiramo test kategoriju RUČNO
        $this->category = Category::create([
            'name' => 'Planinarenje',
            'slug' => 'planinarenje',
            'description' => 'Sve o planinarenju',
            'is_active' => true,
            'order' => 1
        ]);
    }

    /** @test */
    public function anyone_can_view_all_categories()
    {
        // Kreiramo još jednu kategoriju
        Category::create([
            'name' => 'Kampovanje',
            'slug' => 'kampovanje',
            'description' => 'Sve o kampovanju',
            'is_active' => true,
            'order' => 2
        ]);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'categories' => [
                        '*' => ['id', 'name', 'slug', 'description', 'themes_count']
                     ]
                 ]);

        $this->assertCount(2, $response->json('categories'));
    }

    /** @test */
    public function anyone_can_view_single_category()
    {
        $response = $this->getJson('/api/categories/' . $this->category->id);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'category' => ['id', 'name', 'slug', 'description', 'themes_count']
                 ]);

        $this->assertEquals('Planinarenje', $response->json('category.name'));
    }

    /** @test */
    public function admin_can_create_category()
    {
        $this->actingAs($this->admin);

        $categoryData = [
            'name' => 'Nova kategorija',
            'description' => 'Opis nove kategorije',
            'order' => 5
        ];

        $response = $this->postJson('/api/categories', $categoryData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'category' => ['id', 'name', 'slug', 'description']
                 ]);

        $this->assertDatabaseHas('categories', [
            'name' => 'Nova kategorija',
            'slug' => 'nova-kategorija'
        ]);
    }

    /** @test */
    public function regular_user_cannot_create_category()
    {
        $this->actingAs($this->user);

        $categoryData = [
            'name' => 'Nova kategorija',
            'description' => 'Opis nove kategorije'
        ];

        $response = $this->postJson('/api/categories', $categoryData);

        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_user_cannot_create_category()
    {
        $categoryData = [
            'name' => 'Nova kategorija',
            'description' => 'Opis nove kategorije'
        ];

        $response = $this->postJson('/api/categories', $categoryData);

        $response->assertStatus(401);
    }

    /** @test */
    public function admin_can_update_category()
    {
        $this->actingAs($this->admin);

        $updateData = [
            'name' => 'Izmenjena kategorija',
            'description' => 'Izmenjen opis'
        ];

        $response = $this->putJson('/api/categories/' . $this->category->id, $updateData);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'category'
                 ]);

        $this->assertDatabaseHas('categories', [
            'id' => $this->category->id,
            'name' => 'Izmenjena kategorija',
            'slug' => 'izmenjena-kategorija'
        ]);
    }

    /** @test */
    public function regular_user_cannot_update_category()
    {
        $this->actingAs($this->user);

        $updateData = [
            'name' => 'Izmenjena kategorija'
        ];

        $response = $this->putJson('/api/categories/' . $this->category->id, $updateData);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_delete_empty_category()
    {
        $this->actingAs($this->admin);

        $response = $this->deleteJson('/api/categories/' . $this->category->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Kategorija je uspešno obrisana'
                 ]);

        $this->assertDatabaseMissing('categories', ['id' => $this->category->id]);
    }

    /** @test */
    public function admin_cannot_delete_category_with_themes()
    {
        $this->actingAs($this->admin);

        // Kreiramo temu u ovoj kategoriji
        Theme::create([
            'name' => 'Test tema',
            'description' => 'Opis teme',
            'category_id' => $this->category->id
        ]);

        $response = $this->deleteJson('/api/categories/' . $this->category->id);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false
                 ]);

        $this->assertDatabaseHas('categories', ['id' => $this->category->id]);
    }

    /** @test */
    public function regular_user_cannot_delete_category()
    {
        $this->actingAs($this->user);

        $response = $this->deleteJson('/api/categories/' . $this->category->id);

        $response->assertStatus(403);
    }

    /** @test */
    public function anyone_can_view_themes_in_category()
    {
        // Kreiramo nekoliko tema u kategoriji
        Theme::create([
            'name' => 'Tema 1',
            'category_id' => $this->category->id
        ]);
        
        Theme::create([
            'name' => 'Tema 2',
            'category_id' => $this->category->id
        ]);

        $response = $this->getJson('/api/categories/' . $this->category->id . '/themes');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'category',
                     'themes'
                 ]);

        $this->assertCount(2, $response->json('themes'));
    }
}