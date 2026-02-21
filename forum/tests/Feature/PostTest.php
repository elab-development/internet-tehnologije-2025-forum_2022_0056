<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Post;
use App\Models\Theme;
use App\Models\Category;

class PostTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $admin;
    protected $theme;

    protected function setUp(): void
    {
        parent::setUp();

        // Kreiramo test korisnike i temu
        $this->user = User::factory()->create();
        $this->admin = User::factory()->admin()->create();
        
       $category = \App\Models\Category::create([
        'name' => 'Test Kategorija',
        'slug' => 'test-kategorija',
        'description' => 'Ovo je test kategorija',
        'is_active' => true,
        'order' => 1
        ]);
        
        // Kreiramo temu sa ovom kategorijom
        $this->theme = Theme::factory()->create([
            'category_id' => $category->id
        ]);
    }

    /** @test */
    public function user_can_view_all_posts()
    {
        // Kreiramo nekoliko postova
        Post::factory()->count(5)->create([
            'theme_id' => $this->theme->id
        ]);

        $response = $this->getJson('/api/posts');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'posts',
                     'meta' => [
                         'current_page',
                         'per_page',
                         'total',
                         'last_page',
                         'sort_by',
                         'sort_dir'
                     ]
                 ]);
    }

    /** @test */
    public function user_can_filter_posts_by_theme()
    {
        // Kreiramo drugu temu
        $otherTheme = Theme::factory()->create();
        
        // Kreiramo postove u obe teme
        Post::factory()->count(3)->create(['theme_id' => $this->theme->id]);
        Post::factory()->count(2)->create(['theme_id' => $otherTheme->id]);

        $response = $this->getJson('/api/posts?theme_id=' . $this->theme->id);

        $response->assertStatus(200);
        $this->assertEquals(3, $response->json('meta.total'));
    }

    /** @test */
    public function user_can_search_posts()
    {
        $post1 = Post::factory()->create([
            'title' => 'Planinarenje na Kopaoniku',
            'theme_id' => $this->theme->id
        ]);
        
        $post2 = Post::factory()->create([
            'title' => 'Zimski uspon na Tari',
            'theme_id' => $this->theme->id
        ]);

        $response = $this->getJson('/api/posts?q=Kopaonik');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('meta.total'));
        $this->assertEquals('Planinarenje na Kopaoniku', $response->json('posts.0.title'));
    }

    /** @test */
    public function authenticated_user_can_create_post()
    {
        $this->actingAs($this->user);

        $postData = [
            'title' => 'Moj prvi planinarski post',
            'content' => 'Ovo je sadržaj mog posta o planinarenju.',
            'theme_id' => $this->theme->id,
        ];

        $response = $this->postJson('/api/posts', $postData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'post' => [
                         'id',
                         'title',
                         'content',
                         'author',
                         'theme'
                     ]
                 ]);

        $this->assertDatabaseHas('posts', [
            'title' => 'Moj prvi planinarski post',
            'user_id' => $this->user->id
        ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_create_post()
    {
        $postData = [
            'title' => 'Moj prvi planinarski post',
            'content' => 'Ovo je sadržaj mog posta.',
            'theme_id' => $this->theme->id,
        ];

        $response = $this->postJson('/api/posts', $postData);

        $response->assertStatus(401);
    }

    /** @test */
    public function user_cannot_create_post_without_theme()
    {
        $this->actingAs($this->user);

        $postData = [
            'title' => 'Post bez teme',
            'content' => 'Sadržaj posta',
            // theme_id missing
        ];

        $response = $this->postJson('/api/posts', $postData);

        $response->assertStatus(422);
    }

    /** @test */
    public function user_can_view_single_post()
    {
        $post = Post::factory()->create([
            'theme_id' => $this->theme->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->getJson('/api/posts/' . $post->id);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'post' => [
                         'id',
                         'title',
                         'content',
                         'author',
                         'theme',
                         'likes_count',
                         'replies_count'
                     ]
                 ]);
    }

    /** @test */
    public function user_can_delete_own_post()
    {
        $this->actingAs($this->user);

        $post = Post::factory()->create([
            'user_id' => $this->user->id,
            'theme_id' => $this->theme->id
        ]);

        $response = $this->deleteJson('/api/posts/' . $post->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Post deleted successfully'
                 ]);

        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    /** @test */
    public function user_cannot_delete_others_post()
    {
        $this->actingAs($this->user);

        $otherUser = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $otherUser->id,
            'theme_id' => $this->theme->id
        ]);

        $response = $this->deleteJson('/api/posts/' . $post->id);

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_view_post_replies()
    {
        $post = Post::factory()->create([
            'theme_id' => $this->theme->id,
            'user_id' => $this->user->id
        ]);

        // Kreiramo nekoliko odgovora
        Post::factory()->count(3)->replyTo($post)->create();

        $response = $this->getJson('/api/posts/' . $post->id . '/replies');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'post_id',
                     'replies',
                     'meta' => [
                         'current_page',
                         'per_page',
                         'total',
                         'last_page'
                     ]
                 ]);

        $this->assertEquals(3, $response->json('meta.total'));
    }

    /** @test */
    public function user_can_view_post_likes()
    {
        $post = Post::factory()->create([
            'theme_id' => $this->theme->id
        ]);

        // Nekoliko korisnika lajkuje post
        $users = User::factory()->count(3)->create();
        foreach ($users as $user) {
            $post->likes()->create(['user_id' => $user->id]);
        }

        $response = $this->getJson('/api/posts/' . $post->id . '/likes');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'post_id',
                     'likes',
                     'meta'
                 ]);

        $this->assertEquals(3, $response->json('meta.total'));
    }
}