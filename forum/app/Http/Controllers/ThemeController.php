<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Http\Resources\ThemeResource;
use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ThemeController extends Controller
{

    /**
     * @OA\Get(
     *     path="/api/themes",
     *     summary="Lista svih tema",
     *     description="Vraća listu svih tema sa brojem postova",
     *     tags={"Themes"},
     *     @OA\Response(
     *         response=200,
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="themes", 
     *                 type="array", 
     *                 @OA\Items(type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Nema tema",
     *         @OA\JsonContent(
     *             type="string",
     *             example="No themes found."
     *         )
     *     )
     * )
     */

    // Display a listing of the resource.
    public function index()
    {
        $themes = Theme::withCount('posts')->orderBy('name')->get();

        if ($themes->isEmpty()) {
            return response()->json('No themes found.', 404);
        }

        return response()->json([
            'themes' => ThemeResource::collection($themes),
        ]);
    }


    /**
     * @OA\Post(
     *     path="/api/themes",
     *     summary="Kreiranje nove teme",
     *     description="Kreira novu temu (samo admin)",
     *     tags={"Themes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Zimsko planinarenje", description="Naziv teme"),
     *             @OA\Property(property="description", type="string", example="Sve o zimskom planinarenju", description="Opis teme")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Tema kreirana",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Theme created successfully"),
     *             @OA\Property(property="theme", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Nije admin",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Only admins can create themes")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Greška pri validaciji"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     )
     * )
     */

    // Store a newly created resource in storage.
    public function store(Request $request)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Only admins can create themes'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:themes,name',
            'description' => 'nullable|string',
        ]);

        $theme = Theme::create($validated);

        return response()->json([
            'message' => 'Theme created successfully',
            'theme' => new ThemeResource($theme),
        ]);
    }


    /**
     * @OA\Get(
     *     path="/api/themes/{theme}",
     *     summary="Pojedinačna tema",
     *     description="Vraća detalje jedne teme sa brojem postova",
     *     tags={"Themes"},
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
     *             @OA\Property(property="theme", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Tema nije pronađena"
     *     )
     * )
     */

    // Display the specified resource.
    public function show(Theme $theme)
    {
        $theme->loadCount('posts');

        return response()->json([
            'theme' => new ThemeResource($theme),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Theme $theme)
    {
        //
    }
    
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }


    /**
     * @OA\Put(
     *     path="/api/themes/{theme}",
     *     summary="Ažuriranje teme",
     *     description="Ažurira postojeću temu (samo admin)",
     *     tags={"Themes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="theme",
     *         in="path",
     *         description="ID teme",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Zimsko planinarenje", description="Naziv teme"),
     *             @OA\Property(property="description", type="string", example="Sve o zimskom planinarenju", description="Opis teme")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tema ažurirana",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Theme updated successfully"),
     *             @OA\Property(property="theme", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Nije admin",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Only admins can update themes")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Greška pri validaciji"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     )
     * )
     */

    // Update the specified resource in storage.
    public function update(Request $request, Theme $theme)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Only admins can update themes'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:themes,name,' . $theme->id,
            'description' => 'sometimes|nullable|string',
        ]);

        $theme->update($validated);

        return response()->json([
            'message' => 'Theme updated successfully',
            'theme' => new ThemeResource($theme),
        ]);
    }


    /**
     * @OA\Delete(
     *     path="/api/themes/{theme}",
     *     summary="Brisanje teme",
     *     description="Briše temu (samo admin)",
     *     tags={"Themes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="theme",
     *         in="path",
     *         description="ID teme",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tema obrisana",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Theme deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Nije admin",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Only admins can delete themes")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     )
     * )
     */

    //Remove the specified resource from storage.
    public function destroy(Theme $theme)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Only admins can delete themes'], 403);
        }

        $theme->delete();

        return response()->json(['message' => 'Theme deleted successfully']);
    }


    /**
     * @OA\Get(
     *     path="/api/themes/{theme}/posts",
     *     summary="Postovi u temi",
     *     description="Vraća listu postova za određenu temu",
     *     tags={"Themes"},
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
     *             @OA\Property(property="theme", type="object"),
     *             @OA\Property(
     *                 property="posts", 
     *                 type="array", 
     *                 @OA\Items(type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Tema nije pronađena"
     *     )
     * )
     */

    public function posts(Theme $theme)
    {
        $posts = $theme->posts()
            ->whereNull('replied_to_id') // SAMO GLAVNE OBJAVE
            ->with(['author', 'theme'])
            ->withCount(['replies', 'likes'])
            ->latest()
            ->get();

        return response()->json([
            'theme' => new ThemeResource($theme->loadCount('posts')),
            'posts' => PostResource::collection($posts),
        ]);

        /*$posts = $theme->posts()
            ->with(['author', 'theme'])
            ->withCount(['replies', 'likes'])
            ->latest()
            ->get();

        return response()->json([
            'theme' => new ThemeResource($theme->loadCount('posts')),
            'posts' => PostResource::collection($posts),
        ]);*/
    }
}
