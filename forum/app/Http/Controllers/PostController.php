<?php

namespace App\Http\Controllers;

use App\Http\Resources\LikeResource;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    /**
 * @OA\Get(
 *     path="/api/posts",
 *     summary="Lista svih postova",
 *     description="Vraća paginiranu listu postova sa mogućnošću filtriranja i sortiranja",
 *     tags={"Posts"},
 *     @OA\Parameter(
 *         name="per_page",
 *         in="query",
 *         description="Broj postova po stranici (5-100)",
 *         required=false,
 *         @OA\Schema(type="integer", default=20)
 *     ),
 *     @OA\Parameter(
 *         name="sort_by",
 *         in="query",
 *         description="Polje po kome se sortira (created_at, replies_count, likes_count, title)",
 *         required=false,
 *         @OA\Schema(type="string", default="created_at")
 *     ),
 *     @OA\Parameter(
 *         name="sort_dir",
 *         in="query",
 *         description="Smer sortiranja (asc ili desc)",
 *         required=false,
 *         @OA\Schema(type="string", default="desc")
 *     ),
 *     @OA\Parameter(
 *         name="theme",
 *         in="query",
 *         description="Filter po nazivu teme",
 *         required=false,
 *         @OA\Schema(type="string")
 *     ),
 *     @OA\Parameter(
 *         name="theme_id",
 *         in="query",
 *         description="Filter po ID teme",
 *         required=false,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Parameter(
 *         name="author_id",
 *         in="query",
 *         description="Filter po ID autora",
 *         required=false,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Parameter(
 *         name="author",
 *         in="query",
 *         description="Pretraga po imenu autora",
 *         required=false,
 *         @OA\Schema(type="string")
 *     ),
 *     @OA\Parameter(
 *         name="q",
 *         in="query",
 *         description="Pretraga po naslovu i sadržaju",
 *         required=false,
 *         @OA\Schema(type="string")
 *     ),
 *     @OA\Parameter(
 *         name="from",
 *         in="query",
 *         description="Datum od (YYYY-MM-DD)",
 *         required=false,
 *         @OA\Schema(type="string", format="date")
 *     ),
 *     @OA\Parameter(
 *         name="to",
 *         in="query",
 *         description="Datum do (YYYY-MM-DD)",
 *         required=false,
 *         @OA\Schema(type="string", format="date")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Uspešno",
 *         @OA\JsonContent(
 *             @OA\Property(
 *                 property="posts", 
 *                 type="array", 
 *                 @OA\Items(type="object")
 *             ),
 *             @OA\Property(
 *                 property="meta", 
 *                 type="object",
 *                 @OA\Property(property="current_page", type="integer"),
 *                 @OA\Property(property="per_page", type="integer"),
 *                 @OA\Property(property="total", type="integer"),
 *                 @OA\Property(property="last_page", type="integer"),
 *                 @OA\Property(property="sort_by", type="string"),
 *                 @OA\Property(property="sort_dir", type="string")
 *             )
 *         )
 *     )
 * )
 */

    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(5, min(100, $perPage));

        $sortBy  = $request->query('sort_by', 'created_at');
        $sortDir = strtolower($request->query('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['created_at', 'replies_count', 'likes_count', 'title'];
        if (!in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $q = Post::query()
            ->whereNull('replied_to_id')
            ->with(['author', 'theme'])
            ->withCount(['replies', 'likes']);

        if (Auth::check()) {
            $q->with(['likes' => function ($likeQ) {
                $likeQ->where('user_id', Auth::id());
            }]);
        }

        // Filter: tema po name ili ID
        if ($request->filled('theme')) {
            $themeName = $request->query('theme');
            $q->whereHas('theme', fn($tq) => $tq->where('name', $themeName));
        } elseif ($request->filled('theme_id')) {
            $q->where('theme_id', (int) $request->query('theme_id'));
        }

        // Filter: autor po ID ili imenu
        if ($request->filled('author_id')) {
            $q->where('user_id', (int) $request->query('author_id'));
        } elseif ($request->filled('author')) {
            $name = $request->query('author');
            $q->whereHas('author', fn($uq) => $uq->where('name', 'like', "%{$name}%"));
        }

        // Pretraga po title/content
        if ($request->filled('q')) {
            $term = $request->query('q');
            $q->where(function ($s) use ($term) {
                $s->where('title', 'like', "%{$term}%")
                    ->orWhere('content', 'like', "%{$term}%");
            });
        }

        if ($request->filled('from')) {
            $q->whereDate('created_at', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $q->whereDate('created_at', '<=', $request->query('to'));
        }

        $q->orderBy($sortBy, $sortDir);

        $posts = $q->paginate($perPage);

        return response()->json([
            'posts' => PostResource::collection($posts),
            'meta'  => [
                'current_page' => $posts->currentPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
                'last_page' => $posts->lastPage(),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

     /**
     * @OA\Post(
     *     path="/api/posts",
     *     summary="Kreiranje novog posta",
     *     description="Kreira novi post (ili odgovor na postojeći post)",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title","content"},
     *             @OA\Property(property="title", type="string", example="Planinarski pohod na Stolovi", description="Naslov posta"),
     *             @OA\Property(property="content", type="string", example="Juče smo bili na prelepom pohodu...", description="Sadržaj posta"),
     *             @OA\Property(property="theme", type="string", example="Zimsko planinarenje", description="Naziv teme (alternativa za theme_id)"),
     *             @OA\Property(property="theme_id", type="integer", example=1, description="ID teme"),
     *             @OA\Property(property="replied_to_id", type="integer", example=5, description="ID posta na koji se odgovara (ako je odgovor)")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Post uspešno kreiran",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Post created successfully"),
     *             @OA\Property(property="post", ref="#/components/schemas/PostResource")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Nemate pravo publikovanja",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Only users with publishing rights can create posts")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Greška pri validaciji",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Theme is required (theme name or theme_id)")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     )
     * )
     */

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $allowedRoles = ['user', 'moderator', 'admin'];

        if (!$user || !in_array($user->role, $allowedRoles) || !$user->can_publish) {
            return response()->json([
                'error' => 'Only users with publishing rights can create posts',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'theme' => 'sometimes|string|exists:themes,name',
            'theme_id' => 'sometimes|integer|exists:themes,id',
            'replied_to_id' => 'sometimes|nullable|integer|exists:posts,id',
        ]);

        $themeId = null;
        if (isset($validated['theme_id'])) {
            $themeId = (int) $validated['theme_id'];
        } elseif (isset($validated['theme'])) {
            $themeId = Theme::where('name', $validated['theme'])->value('id');
        }

        if (!empty($validated['replied_to_id'])) {
            $parent = Post::find($validated['replied_to_id']);
            if (!$parent) {
                return response()->json(['error' => 'Parent post not found'], 422);
            }
            $themeId = $themeId ?: $parent->theme_id;

            if ($themeId !== $parent->theme_id) {
                return response()->json([
                    'error' => 'Reply must be in the same theme as its parent post',
                ], 422);
            }
        }

        if (!$themeId) {
            return response()->json([
                'error' => 'Theme is required (theme name or theme_id)',
            ], 422);
        }

        $post = Post::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'user_id' => $user->id,
            'theme_id' => $themeId,
            'replied_to_id' => $validated['replied_to_id'] ?? null,
        ]);

        $post->load(['author', 'theme'])->loadCount(['replies', 'likes']);

        if (Auth::check()) {
            $post->load(['likes' => fn($q) => $q->where('user_id', Auth::id())]);
        }

        return response()->json([
            'message' => 'Post created successfully',
            'post'    => new PostResource($post),
        ], 201);
    }


    /**
     * @OA\Get(
     *     path="/api/posts/{post}",
     *     summary="Pojedinačni post",
     *     description="Vraća detalje jednog posta sa svim povezanim podacima",
     *     tags={"Posts"},
     *     @OA\Parameter(
     *         name="post",
     *         in="path",
     *         description="ID posta",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(property="post", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Post nije pronađen"
     *     )
     * )
     */

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        $post->load([
            'author',
            'theme',
            'parent',
        ])->loadCount(['replies', 'likes']);

        // Ovo se izvršava SAMO za prijavljene korisnike
        if (Auth::check()) {
            $post->load(['likes' => function ($q) {
                $q->where('user_id', Auth::id());
            }]);
        }

        return response()->json([
            'post' => new PostResource($post),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        //
    }


    /**
     * @OA\Delete(
     *     path="/api/posts/{post}",
     *     summary="Brisanje posta",
     *     description="Briše post (samo vlasnik)",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="post",
     *         in="path",
     *         description="ID posta",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Post uspešno obrisan",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Post deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Niste vlasnik posta",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="You can only delete your own posts")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     )
     * )
     */

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        $user = Auth::user();
        if (!$user || $user->id !== $post->user_id) {
            return response()->json(['error' => 'You can only delete your own posts'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }


    /**
 * @OA\Get(
 *     path="/api/posts/{post}/replies",
 *     summary="Odgovori na post",
 *     description="Vraća listu odgovora za određeni post",
 *     tags={"Posts"},
 *     @OA\Parameter(
 *         name="post",
 *         in="path",
 *         description="ID posta",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Parameter(
 *         name="per_page",
 *         in="query",
 *         description="Broj odgovora po stranici",
 *         required=false,
 *         @OA\Schema(type="integer", default=20)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Uspešno",
 *         @OA\JsonContent(
 *             @OA\Property(property="post_id", type="integer"),
 *             @OA\Property(
 *                 property="replies", 
 *                 type="array", 
 *                 @OA\Items(type="object")
 *             ),
 *             @OA\Property(
 *                 property="meta", 
 *                 type="object",
 *                 @OA\Property(property="current_page", type="integer"),
 *                 @OA\Property(property="per_page", type="integer"),
 *                 @OA\Property(property="total", type="integer"),
 *                 @OA\Property(property="last_page", type="integer")
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Post nije pronađen"
 *     )
 * )
 */

    public function replies(Post $post, Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(5, min(100, $perPage));

        $replies = $post->replies()
            ->with(['author', 'theme'])
            ->withCount(['replies', 'likes'])
            ->latest()
            ->paginate($perPage);

        if (Auth::check()) {
            $replies->getCollection()->load(['likes' => fn($q) => $q->where('user_id', Auth::id())]);
        }

        return response()->json([
            'post_id' => $post->id,
            'replies' => PostResource::collection($replies),
            'meta'    => [
                'current_page' => $replies->currentPage(),
                'per_page' => $replies->perPage(),
                'total' => $replies->total(),
                'last_page' => $replies->lastPage(),
            ],
        ]);
    }


    /**
 * @OA\Get(
 *     path="/api/posts/{post}/likes",
 *     summary="Lajkovi na postu",
 *     description="Vraća listu korisnika koji su lajkovali post",
 *     tags={"Posts"},
 *     @OA\Parameter(
 *         name="post",
 *         in="path",
 *         description="ID posta",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Parameter(
 *         name="per_page",
 *         in="query",
 *         description="Broj lajkova po stranici",
 *         required=false,
 *         @OA\Schema(type="integer", default=50)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Uspešno",
 *         @OA\JsonContent(
 *             @OA\Property(property="post_id", type="integer"),
 *             @OA\Property(
 *                 property="likes", 
 *                 type="array", 
 *                 @OA\Items(type="object")
 *             ),
 *             @OA\Property(
 *                 property="meta", 
 *                 type="object",
 *                 @OA\Property(property="current_page", type="integer"),
 *                 @OA\Property(property="per_page", type="integer"),
 *                 @OA\Property(property="total", type="integer"),
 *                 @OA\Property(property="last_page", type="integer")
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Post nije pronađen"
 *     )
 * )
 */

    public function likes(Post $post, Request $request)
    {
        $perPage = (int) $request->query('per_page', 50);
        $perPage = max(5, min(100, $perPage));

        $likes = $post->likes()
            ->with('user')
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'post_id' => $post->id,
            'likes' => LikeResource::collection($likes),
            'meta' => [
                'current_page' => $likes->currentPage(),
                'per_page' => $likes->perPage(),
                'total' => $likes->total(),
                'last_page' => $likes->lastPage(),
            ],
        ]);
    }
}
