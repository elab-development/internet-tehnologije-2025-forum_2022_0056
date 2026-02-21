<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Post;
use App\Models\Category;
use App\Models\Theme;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $moderator;
    protected $regularUser;
    protected $category;
    protected $theme;

    protected function setUp(): void
    {
        parent::setUp();

        // Kreiramo različite tipove korisnika
        $this->admin = User::factory()->admin()->create([
            'email' => 'admin@test.com',
            'name' => 'Admin User'
        ]);
        
        $this->moderator = User::factory()->moderator()->create([
            'email' => 'moderator@test.com',
            'name' => 'Moderator User'
        ]);
        
        $this->regularUser = User::factory()->create([
            'email' => 'user@test.com',
            'name' => 'Regular User'
        ]);

        // Kreiramo kategoriju i temu za testove
        $this->category = Category::create([
            'name' => 'Test kategorija',
            'slug' => 'test-kategorija',
            'is_active' => true
        ]);

        $this->theme = Theme::create([
            'name' => 'Test tema',
            'category_id' => $this->category->id
        ]);
    }

    /** @test */
    public function admin_can_view_all_users()
    {
        $this->actingAs($this->admin);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'users' => [
                         '*' => ['id', 'name', 'email', 'role', 'can_publish', 'posts_count', 'likes_count']
                     ],
                     'meta' => [
                         'current_page',
                         'per_page',
                         'total',
                         'last_page'
                     ]
                 ]);

        // Trebalo bi da vidi sve korisnike (3)
        $this->assertEquals(3, $response->json('meta.total'));
    }

    /** @test */
    public function moderator_can_view_all_users()
    {
        $this->actingAs($this->moderator);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(200);
        $this->assertEquals(3, $response->json('meta.total'));
    }

    /** @test */
    public function regular_user_cannot_view_all_users()
    {
        $this->actingAs($this->regularUser);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_user_cannot_view_all_users()
    {
        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(401);
    }

    /** @test */
    public function admin_can_search_users()
    {
        $this->actingAs($this->admin);

        $response = $this->getJson('/api/admin/users?search=Admin');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('meta.total'));
        $this->assertEquals('Admin User', $response->json('users.0.name'));
    }

    /** @test */
    public function admin_can_filter_users_by_role()
    {
        $this->actingAs($this->admin);

        $response = $this->getJson('/api/admin/users?role=admin');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('meta.total'));
        $this->assertEquals('admin', $response->json('users.0.role'));
    }

    /** @test */
    public function admin_can_toggle_user_publish_status()
    {
        $this->actingAs($this->admin);

        // Proveri početni status
        $this->assertTrue($this->regularUser->can_publish);

        // Promeni status
        $response = $this->postJson('/api/admin/users/' . $this->regularUser->id . '/toggle-publish');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'user'
                 ]);

        // Proveri da je status promenjen
        $this->regularUser->refresh();
        $this->assertFalse($this->regularUser->can_publish);

        // Vrati status
        $this->postJson('/api/admin/users/' . $this->regularUser->id . '/toggle-publish');
        $this->regularUser->refresh();
        $this->assertTrue($this->regularUser->can_publish);
    }

    /** @test */
    public function moderator_can_toggle_regular_user_publish_status()
    {
        $this->actingAs($this->moderator);

        $response = $this->postJson('/api/admin/users/' . $this->regularUser->id . '/toggle-publish');

        $response->assertStatus(200);
    }

    /** @test */
    public function moderator_cannot_toggle_admin_publish_status()
    {
        $this->actingAs($this->moderator);

        $response = $this->postJson('/api/admin/users/' . $this->admin->id . '/toggle-publish');

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_change_user_role()
    {
        $this->actingAs($this->admin);

        $response = $this->putJson('/api/admin/users/' . $this->regularUser->id . '/role', [
            'role' => 'moderator'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'User role changed from user to moderator'
                 ]);

        $this->regularUser->refresh();
        $this->assertEquals('moderator', $this->regularUser->role);
    }

    /** @test */
    public function admin_cannot_change_own_role()
    {
        $this->actingAs($this->admin);

        $response = $this->putJson('/api/admin/users/' . $this->admin->id . '/role', [
            'role' => 'user'
        ]);

        $response->assertStatus(400)
                 ->assertJson([
                     'error' => 'Cannot change your own role'
                 ]);
    }

    /** @test */
    public function moderator_cannot_change_user_role()
    {
        $this->actingAs($this->moderator);

        $response = $this->putJson('/api/admin/users/' . $this->regularUser->id . '/role', [
            'role' => 'moderator'
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_view_stats()
    {
        $this->actingAs($this->admin);

        // Kreiramo neke postove za statistiku
        Post::factory()->count(5)->create([
            'user_id' => $this->regularUser->id,
            'theme_id' => $this->theme->id
        ]);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'stats' => [
                         'users',
                         'posts',
                         'themes',
                         'likes',
                         'recent_users',
                         'recent_posts'
                     ],
                     'updated_at'
                 ]);

        $this->assertTrue($response->json('success'));
        $this->assertEquals(3, $response->json('stats.users')); // admin, moderator, user
        $this->assertEquals(5, $response->json('stats.posts'));
    }

    /** @test */
    public function moderator_can_view_stats()
    {
        $this->actingAs($this->moderator);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));
    }

    /** @test */
    public function regular_user_cannot_view_stats()
    {
        $this->actingAs($this->regularUser);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(403);
    }
}