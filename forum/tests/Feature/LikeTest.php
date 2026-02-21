<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Post;
use App\Models\Theme;
use App\Models\Category;
use App\Models\Like;

class LikeTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $otherUser;
    protected $admin;
    protected $post;

    protected function setUp(): void
    {
        parent::setUp();

        // Kreiramo korisnike
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
        $this->admin = User::factory()->admin()->create();
        
        // Kreiramo kategoriju
        $category = Category::create([
            'name' => 'Planinarenje',
            'slug' => 'planinarenje',
            'is_active' => true
        ]);
        
        // Kreiramo temu
        $theme = Theme::create([
            'name' => 'Zimsko planinarenje',
            'category_id' => $category->id
        ]);
        
        // Kreiramo post
        $this->post = Post::factory()->create([
            'user_id' => $this->user->id,
            'theme_id' => $theme->id
        ]);
    }

    /** @test */
    public function authenticated_user_can_like_post()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/posts/' . $this->post->id . '/like');

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Liked',
                     'liked' => true,
                     'post_id' => $this->post->id
                 ]);

        $this->assertDatabaseHas('likes', [
            'user_id' => $this->user->id,
            'post_id' => $this->post->id
        ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_like_post()
    {
        $response = $this->postJson('/api/posts/' . $this->post->id . '/like');

        $response->assertStatus(401);
    }

    /** @test */
    public function user_can_unlike_post()
    {
        $this->actingAs($this->user);

        // Prvo lajkujemo
        $this->postJson('/api/posts/' . $this->post->id . '/like');

        // Onda unosimo lajk
        $response = $this->deleteJson('/api/posts/' . $this->post->id . '/like');

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Unliked',
                     'liked' => false,
                     'post_id' => $this->post->id
                 ]);

        $this->assertDatabaseMissing('likes', [
            'user_id' => $this->user->id,
            'post_id' => $this->post->id
        ]);
    }

    /** @test */
    public function user_can_check_if_they_liked_post()
    {
        $this->actingAs($this->user);

        // Prvo lajkujemo
        $this->postJson('/api/posts/' . $this->post->id . '/like');

        // Proveravamo
        $response = $this->getJson('/api/posts/' . $this->post->id . '/check-like');

        $response->assertStatus(200)
                 ->assertJson([
                     'post_id' => $this->post->id,
                     'is_liked' => true
                 ]);
    }

    /** @test */
    /*public function user_can_see_their_likes_list()
    {
        $this->actingAs($this->user);

        // Lajkujemo par postova
        $this->postJson('/api/posts/' . $this->post->id . '/like');
        
        // Napravimo još jedan post pa lajkujemo i njega
        $anotherPost = Post::factory()->create([
            'user_id' => $this->otherUser->id,
            'theme_id' => $this->post->theme_id
        ]);
        $this->postJson('/api/posts/' . $anotherPost->id . '/like');

        // Proveravamo listu lajkova
        $response = $this->getJson('/api/likes');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'user_id',
                     'likes' => [
                         '*' => ['id', 'user_id', 'post_id', 'post', 'user']
                     ],
                     'meta'
                 ]);

        $this->assertCount(2, $response->json('likes'));
    }*/

    /** @test */
    public function user_cannot_see_others_likes_list()
    {
        $this->actingAs($this->user);

        // Lajkujemo post
        $this->postJson('/api/posts/' . $this->post->id . '/like');

        // Drugi korisnik pokušava da vidi tuđe lajkove
        $this->actingAs($this->otherUser);
        
        $response = $this->getJson('/api/likes?user_id=' . $this->user->id);

        // Trebalo bi da vidi samo svoje lajkove (0), ne tuđe
        $response->assertStatus(200);
        $this->assertEquals($this->otherUser->id, $response->json('user_id'));
    }

    /** @test */
    public function admin_can_see_any_users_likes()
    {
        // User lajkuje post
        $this->actingAs($this->user);
        $this->postJson('/api/posts/' . $this->post->id . '/like');

        // Admin gleda user-ove lajkove
        $this->actingAs($this->admin);
        $response = $this->getJson('/api/likes?user_id=' . $this->user->id);

        $response->assertStatus(200);
        $this->assertEquals($this->user->id, $response->json('user_id'));
        $this->assertCount(1, $response->json('likes'));
    }

    /** @test */
    public function post_likes_count_increases_when_liked()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/posts/' . $this->post->id . '/like');

        $response->assertJson([
            'likes_count' => 1
        ]);

        // Proveravamo da je broj lajkova povećan
        $this->post->refresh();
        $this->assertEquals(1, $this->post->likes()->count());
    }

    /** @test */
    public function post_likes_count_decreases_when_unliked()
    {
        $this->actingAs($this->user);

        // Lajkujemo
        $this->postJson('/api/posts/' . $this->post->id . '/like');
        
        // Unlikujemo
        $response = $this->deleteJson('/api/posts/' . $this->post->id . '/like');

        $response->assertJson([
            'likes_count' => 0
        ]);

        // Proveravamo da je broj lajkova smanjen
        $this->post->refresh();
        $this->assertEquals(0, $this->post->likes()->count());
    }

    /** @test */
    public function user_cannot_like_same_post_twice()
    {
        $this->actingAs($this->user);

        // Prvi lajk
        $this->postJson('/api/posts/' . $this->post->id . '/like');
        
        // Drugi lajk (trebalo bi da bude bez efekta)
        $this->postJson('/api/posts/' . $this->post->id . '/like');

        // Proveravamo da je samo jedan lajk u bazi
        $this->assertEquals(1, Like::where([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id
        ])->count());
    }
}