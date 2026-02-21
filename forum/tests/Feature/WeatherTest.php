<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Theme;
use App\Models\Category;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class WeatherTest extends TestCase
{
    use RefreshDatabase;

    protected $themeWithLocation;
    protected $themeWithoutLocation;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::create([
            'name' => 'Planinarenje',
            'slug' => 'planinarenje',
            'is_active' => true
        ]);

        // Tema sa lokacijom
        $this->themeWithLocation = Theme::create([
            'name' => 'Kopaonik',
            'category_id' => $category->id,
            'location_name' => 'Kopaonik, Srbija',
            'latitude' => 43.2850,
            'longitude' => 20.8144
        ]);

        // Tema bez lokacije
        $this->themeWithoutLocation = Theme::create([
            'name' => 'Planinarenje opšte',
            'category_id' => $category->id,
            'location_name' => null,
            'latitude' => null,
            'longitude' => null
        ]);
    }

    /** @test */
    public function anyone_can_get_weather_for_theme_with_location()
    {
        // Lažiranje HTTP odgovora
        Http::fake([
            'api.openweathermap.org/*' => Http::response([
                'main' => [
                    'temp' => 15.5,
                    'feels_like' => 14.2,
                    'humidity' => 65
                ],
                'wind' => [
                    'speed' => 3.6
                ],
                'weather' => [
                    ['description' => 'vedro nebo']
                ]
            ], 200)
        ]);

        $response = $this->getJson('/api/weather/theme/' . $this->themeWithLocation->id);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'location',
                     'weather' => [
                         'temperature',
                         'feels_like',
                         'humidity',
                         'wind',
                         'description'
                     ],
                     'cached'
                 ]);

        $this->assertEquals('Kopaonik, Srbija', $response->json('location'));
        $this->assertEquals(15.5, $response->json('weather.temperature'));
    }

    /** @test */
    public function cannot_get_weather_for_theme_without_location()
    {
        $response = $this->getJson('/api/weather/theme/' . $this->themeWithoutLocation->id);

        $response->assertStatus(422)
                 ->assertJson([
                     'error' => 'Theme has no location data'
                 ]);
    }

    /** @test */
    public function weather_response_is_cached()
    {
        Http::fake([
            'api.openweathermap.org/*' => Http::response([
                'main' => ['temp' => 15.5],
                'weather' => [['description' => 'vedro']]
            ], 200)
        ]);

        // Prvi poziv - ide ka API-ju
        $response1 = $this->getJson('/api/weather/theme/' . $this->themeWithLocation->id);
        $response1->assertStatus(200);
        $this->assertFalse($response1->json('cached')); // False jer je prvi put

        // Drugi poziv - trebalo bi da bude keširano
        $response2 = $this->getJson('/api/weather/theme/' . $this->themeWithLocation->id);
        $response2->assertStatus(200);
        $this->assertTrue($response2->json('cached')); // True jer je keširano
    }

    /** @test */
    public function handles_weather_api_error()
    {
        Http::fake([
            'api.openweathermap.org/*' => Http::response([], 500)
        ]);

        $response = $this->getJson('/api/weather/theme/' . $this->themeWithLocation->id);

        $response->assertStatus(502);
    }

    /** @test */
    public function weather_for_nonexistent_theme_returns_404()
    {
        $response = $this->getJson('/api/weather/theme/99999');

        $response->assertStatus(404);
    }
}