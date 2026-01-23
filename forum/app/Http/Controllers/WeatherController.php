<?php

namespace App\Http\Controllers;

use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class WeatherController extends Controller
{
     public function byTheme(Theme $theme)
    {
        if (!$theme->latitude || !$theme->longitude) {
            return response()->json([
                'error' => 'Theme has no location data'
            ], 422);
        }

        $cacheKey = "weather:theme:{$theme->id}";

        $data = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($theme) {
            $response = Http::get('https://api.openweathermap.org/data/2.5/weather', [
                'lat' => $theme->latitude,
                'lon' => $theme->longitude,
                'units' => 'metric',
                'appid' => config('services.openweather.key'),
            ]);

            if (!$response->ok()) {
                abort(502, 'Weather service unavailable');
            }

            return $response->json();
        });

        return response()->json([
            'location' => $theme->location_name,
            'weather' => [
                'temperature' => $data['main']['temp'] ?? null,
                'feels_like' => $data['main']['feels_like'] ?? null,
                'humidity' => $data['main']['humidity'] ?? null,
                'wind' => $data['wind']['speed'] ?? null,
                'description' => $data['weather'][0]['description'] ?? null,
            ],
            'cached' => true,
        ]);
    }
}
