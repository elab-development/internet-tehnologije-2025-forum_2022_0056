<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Theme;
use App\Models\Category;
use App\Models\Post;

class ThemeTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $admin;
    protected $category;
    protected $theme;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->admin = User::factory()->admin()->create();
        
        // Kreiramo kategoriju RUČNO
        $this->category = Category::create([
            'name' => 'Planinarenje',
            'slug' => 'planinarenje',
            'is_active' => true
        ]);
        
        // Kreiramo temu
        $this->theme = Theme::create([
            'name' => 'Zimsko planinarenje',
            'description' => 'Sve o zimskom planinarenju',
            'category_id' => $this->category->id,
            'location_name' => 'Kopaonik',
            'latitude' => 43.2850,
            'longitude' => 20.8144
        ]);
    }

    /** @test */
    public function anyone_can_view_all_themes()
    {
        // Kreiramo još jednu temu
        Theme::create([
            'name' => 'Letnje planinarenje',
            'category_id' => $this->category->id
        ]);

        $response = $this->getJson('/api/themes');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'themes' => [
                        '*' => ['id', 'name', 'description', 'posts_count']
                     ]
                 ]);

        $this->assertCount(2, $response->json('themes'));
    }

    /** @test */
    public function anyone_can_view_single_theme()
    {
        $response = $this->getJson('/api/themes/' . $this->theme->id);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'theme' => ['id', 'name', 'description', 'posts_count']
                 ]);

        $this->assertEquals('Zimsko planinarenje', $response->json('theme.name'));
    }

    /** @test */
    public function admin_can_create_theme()
    {
        $this->actingAs($this->admin);

        $themeData = [
            'name' => 'Nova tema',
            'description' => 'Opis nove teme',
            'category_id' => $this->category->id
        ];

        $response = $this->postJson('/api/themes', $themeData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'theme' => ['id', 'name', 'description']
                 ]);

        $this->assertDatabaseHas('themes', [
            'name' => 'Nova tema',
            'category_id' => $this->category->id
        ]);
    }

    /** @test */
    public function regular_user_cannot_create_theme()
    {
        $this->actingAs($this->user);

        $themeData = [
            'name' => 'Nova tema',
            'category_id' => $this->category->id
        ];

        $response = $this->postJson('/api/themes', $themeData);

        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_user_cannot_create_theme()
    {
        $themeData = [
            'name' => 'Nova tema',
            'category_id' => $this->category->id
        ];

        $response = $this->postJson('/api/themes', $themeData);

        $response->assertStatus(401);
    }

    /** @test */
    public function admin_can_update_theme()
    {
        $this->actingAs($this->admin);

        $updateData = [
            'name' => 'Izmenjena tema',
            'description' => 'Izmenjen opis'
        ];

        $response = $this->putJson('/api/themes/' . $this->theme->id, $updateData);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Theme updated successfully'
                 ]);

        $this->assertDatabaseHas('themes', [
            'id' => $this->theme->id,
            'name' => 'Izmenjena tema'
        ]);
    }

    /** @test */
    public function regular_user_cannot_update_theme()
    {
        $this->actingAs($this->user);

        $updateData = [
            'name' => 'Izmenjena tema'
        ];

        $response = $this->putJson('/api/themes/' . $this->theme->id, $updateData);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_delete_theme()
    {
        $this->actingAs($this->admin);

        $response = $this->deleteJson('/api/themes/' . $this->theme->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Theme deleted successfully'
                 ]);

        $this->assertDatabaseMissing('themes', ['id' => $this->theme->id]);
    }

    /** @test */
    public function regular_user_cannot_delete_theme()
    {
        $this->actingAs($this->user);

        $response = $this->deleteJson('/api/themes/' . $this->theme->id);

        $response->assertStatus(403);
    }

    /** @test */
    public function anyone_can_view_posts_in_theme()
    {
        // Kreiramo nekoliko postova u temi
        Post::factory()->count(3)->create([
            'theme_id' => $this->theme->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->getJson('/api/themes/' . $this->theme->id . '/posts');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'theme',
                     'posts'
                 ]);

        $this->assertCount(3, $response->json('posts'));
    }

    /** @test */
    public function theme_shows_correct_post_count()
    {
        // Kreiramo postove
        Post::factory()->count(5)->create([
            'theme_id' => $this->theme->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->getJson('/api/themes/' . $this->theme->id);

        $this->assertEquals(5, $response->json('theme.posts_count'));
    }
}