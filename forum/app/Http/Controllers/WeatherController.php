<?php

namespace App\Http\Controllers;

use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class WeatherController extends Controller
{

    /**
     * @OA\Get(
     *     path="/api/themes/{theme}/weather",
     *     summary="Vremenska prognoza za temu",
     *     description="Vraća trenutne vremenske podatke za lokaciju teme (keširano 10 minuta)",
     *     tags={"Weather"},
     *     @OA\Parameter(
     *         name="theme",
     *         in="path",
     *         description="ID teme",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(property="location", type="string", example="Kopaonik"),
     *             @OA\Property(
     *                 property="weather",
     *                 type="object",
     *                 @OA\Property(property="temperature", type="number", format="float", example=15.5),
     *                 @OA\Property(property="feels_like", type="number", format="float", example=14.2),
     *                 @OA\Property(property="humidity", type="integer", example=65),
     *                 @OA\Property(property="wind", type="number", format="float", example=3.6),
     *                 @OA\Property(property="description", type="string", example="clear sky")
     *             ),
     *             @OA\Property(property="cached", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Tema nema lokaciju",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Theme has no location data")
     *         )
     *     ),
     *     @OA\Response(
     *         response=502,
     *         description="Weather servis nije dostupan"
     *     )
     * )
     */

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
