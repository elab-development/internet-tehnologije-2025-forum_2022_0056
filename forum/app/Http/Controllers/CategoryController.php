<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CategoryController extends Controller
{

    /**
     * @OA\Get(
     *     path="/api/categories",
     *     summary="Lista svih kategorija",
     *     description="Vraća listu svih aktivnih kategorija sa brojem tema",
     *     tags={"Categories"},
     *     @OA\Response(
     *         response=200,
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="categories", 
     *                 type="array", 
     *                 @OA\Items(type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Greška na serveru",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="error", type="string", example="Greška pri učitavanju kategorija")
     *         )
     *     )
     * )
     */

    // Prikaz svih kategorija
    public function index()
    {
        try {
            // Uzmi sve kategorije, sortirane
            $categories = Category::where('is_active', true)
                ->orderBy('order')
                ->orderBy('name')
                ->withCount('themes')
                ->get();

            return response()->json([
                'success' => true,
                'categories' => CategoryResource::collection($categories),
            ]);
        } catch (\Exception $e) {
            // Vrati detailed error za debugging
            return response()->json([
                'success' => false,
                'error' => 'Greška pri učitavanju kategorija: ' . $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }


    /**
     * @OA\Get(
     *     path="/api/categories/{category}",
     *     summary="Pojedinačna kategorija",
     *     description="Vraća detalje jedne kategorije",
     *     tags={"Categories"},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="ID kategorije",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="category", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Kategorija nije pronađena"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Greška na serveru"
     *     )
     * )
     */

    // Prikaz jedne kategorije
    public function show(Category $category)
    {
        try {
            // Učitaj broj tema u kategoriji
            $category->loadCount('themes');
            
            return response()->json([
                'success' => true,
                'category' => new CategoryResource($category),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Greška pri učitavanju kategorije: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * @OA\Post(
     *     path="/api/categories",
     *     summary="Kreiranje nove kategorije",
     *     description="Kreira novu kategoriju (samo admin)",
     *     tags={"Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Planinarenje", description="Naziv kategorije"),
     *             @OA\Property(property="description", type="string", example="Sve o planinarenju", description="Opis kategorije"),
     *             @OA\Property(property="order", type="integer", example=1, description="Redosled prikaza")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Kategorija kreirana",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Kategorija je uspešno kreirana"),
     *             @OA\Property(property="category", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Nije admin",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="error", type="string", example="Samo administratori mogu kreirati kategorije")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Greška pri validaciji",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="error", type="string", example="Validacija nije uspela"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     )
     * )
     */

    // Kreiranje nove kategorije (samo admin)
    public function store(Request $request)
    {
        try {
            // Provera da li je korisnik admin
            if (!Auth::check() || !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Samo administratori mogu kreirati kategorije'
                ], 403);
            }

            // Validacija podataka
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name',
                'description' => 'nullable|string',
                'order' => 'sometimes|integer|min:0',
            ]);

            // Generiši slug od imena
            $validated['slug'] = Str::slug($validated['name']);
            $validated['is_active'] = true; // Podrazumevano aktivna

            // Kreiraj kategoriju
            $category = Category::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Kategorija je uspešno kreirana',
                'category' => new CategoryResource($category),
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validacija nije uspela',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Greška pri kreiranju kategorije: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * @OA\Put(
     *     path="/api/categories/{category}",
     *     summary="Ažuriranje kategorije",
     *     description="Ažurira postojeću kategoriju (samo admin)",
     *     tags={"Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="ID kategorije",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Planinarenje", description="Naziv kategorije"),
     *             @OA\Property(property="description", type="string", example="Sve o planinarenju", description="Opis kategorije"),
     *             @OA\Property(property="order", type="integer", example=1, description="Redosled prikaza"),
     *             @OA\Property(property="is_active", type="boolean", example=true, description="Status kategorije")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Kategorija ažurirana",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Kategorija je uspešno ažurirana"),
     *             @OA\Property(property="category", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Nije admin",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="error", type="string", example="Samo administratori mogu ažurirati kategorije")
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

    /**
     * Ažuriranje kategorije (samo admin)
     */
    public function update(Request $request, Category $category)
    {
        try {
            // Provera da li je korisnik admin
            if (!Auth::check() || !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Samo administratori mogu ažurirati kategorije'
                ], 403);
            }

            // Validacija podataka
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255|unique:categories,name,' . $category->id,
                'description' => 'sometimes|nullable|string',
                'order' => 'sometimes|integer|min:0',
                'is_active' => 'sometimes|boolean',
            ]);

            // Ako se menja ime, generiši novi slug
            if (isset($validated['name'])) {
                $validated['slug'] = Str::slug($validated['name']);
            }

            // Ažuriraj kategoriju
            $category->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Kategorija je uspešno ažurirana',
                'category' => new CategoryResource($category),
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validacija nije uspela',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Greška pri ažuriranju kategorije: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * @OA\Delete(
     *     path="/api/categories/{category}",
     *     summary="Brisanje kategorije",
     *     description="Briše kategoriju (samo admin, samo ako nema tema)",
     *     tags={"Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="ID kategorije",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Kategorija obrisana",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Kategorija je uspešno obrisana")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Nije admin",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="error", type="string", example="Samo administratori mogu brisati kategorije")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Kategorija ima teme",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="error", type="string", example="Ne možete obrisati kategoriju koja ima teme")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     )
     * )
     */

    // Brisanje kategorije (samo admin)
    public function destroy(Category $category)
    {
        try {
            // Provera da li je korisnik admin
            if (!Auth::check() || !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Samo administratori mogu brisati kategorije'
                ], 403);
            }

            // Proveri da li kategorija ima teme
            if ($category->themes()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ne možete obrisati kategoriju koja ima teme. Prvo premestite teme u drugu kategoriju.'
                ], 422);
            }

            // Obriši kategoriju
            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kategorija je uspešno obrisana',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Greška pri brisanju kategorije: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * @OA\Get(
     *     path="/api/categories/{category}/themes",
     *     summary="Teme u kategoriji",
     *     description="Vraća listu tema za određenu kategoriju",
     *     tags={"Categories"},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="ID kategorije",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="category", type="object"),
     *             @OA\Property(
     *                 property="themes", 
     *                 type="array", 
     *                 @OA\Items(type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Kategorija nije pronađena"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Greška na serveru"
     *     )
     * )
     */

    //Prikaz tema u kategoriji
    public function themes(Category $category)
    {
        try {
            // Uzmi sve teme u kategoriji
            $themes = $category->themes()
                ->withCount('posts') // Broj postova u temi
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'category' => new CategoryResource($category->loadCount('themes')),
                'themes' => $themes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Greška pri učitavanju tema: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * DEBUG METODA - samo za development
     */
    public function debug()
    {
        try {
            // Proveri da li model postoji
            $modelExists = class_exists('App\Models\Category');
            
            // Proveri da li se može instancirati
            $instance = new Category();
            
            // Proveri da li može da se query-uje
            $count = Category::count();
            $all = Category::all();
            
            // Proveri da li ima podataka
            $hasData = $count > 0;
            
            // Proveri strukturu
            $first = Category::first();
            $structure = $first ? get_object_vars($first) : null;
            
            return response()->json([
                'success' => true,
                'debug_info' => [
                    'model_exists' => $modelExists,
                    'can_instantiate' => $instance !== null,
                    'count' => $count,
                    'has_data' => $hasData,
                    'first_record' => $first,
                    'structure' => $structure,
                    'all_records' => $all,
                    'table_columns' => $first ? array_keys($structure) : []
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'DEBUG ERROR: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}