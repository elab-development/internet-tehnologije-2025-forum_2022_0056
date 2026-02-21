<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{

    /**
     * @OA\Get(
     *     path="/api/admin/users",
     *     summary="Lista svih korisnika",
     *     description="Vraća paginiranu listu korisnika sa filterima (samo admin/moderator)",
     *     tags={"Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Broj korisnika po stranici (5-100)",
     *         required=false,
     *         @OA\Schema(type="integer", default=20)
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Pretraga po imenu ili emailu",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="role",
     *         in="query",
     *         description="Filter po ulozi (user, moderator, admin)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"user", "moderator", "admin"})
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Polje sortiranja (id, name, email, role, created_at, posts_count)",
     *         required=false,
     *         @OA\Schema(type="string", default="created_at")
     *     ),
     *     @OA\Parameter(
     *         name="sort_dir",
     *         in="query",
     *         description="Smer sortiranja (asc/desc)",
     *         required=false,
     *         @OA\Schema(type="string", default="desc")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="users", 
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
     *                 @OA\Property(property="has_more_pages", type="boolean"),
     *                 @OA\Property(property="sort_by", type="string"),
     *                 @OA\Property(property="sort_dir", type="string"),
     *                 @OA\Property(property="search", type="string", nullable=true),
     *                 @OA\Property(property="role_filter", type="string", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Nije autorizovan",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unauthorized")
     *         )
     *     )
     * )
     */

    public function getUsers(Request $request)
    {
        // Provera da li je admin ili moderator
        $currentUser = auth()->user();
        if (!$currentUser || !in_array($currentUser->role, ['admin', 'moderator'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Paginacija
        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(5, min(100, $perPage));
        
        // Search
        $search = $request->query('search');
        
        // Filter po ulozi
        $role = $request->query('role');

        $query = User::query();

        // Pretraga po imenu ili emailu
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter po ulozi
        if ($role && in_array($role, ['user', 'moderator', 'admin'])) {
            $query->where('role', $role);
        }

        // Sortiranje
        $sortBy = $request->query('sort_by', 'created_at');
        $sortDir = strtolower($request->query('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        
        $allowedSorts = ['id', 'name', 'email', 'role', 'created_at', 'posts_count'];
        if (!in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $query->orderBy($sortBy, $sortDir);

        // Dobavi korisnike sa brojem postova i lajkova
        $users = $query->withCount(['posts', 'likes'])
                      ->paginate($perPage);

        return response()->json([
            'users' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
                'has_more_pages' => $users->hasMorePages(),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
                'search' => $search,
                'role_filter' => $role,
            ],
        ]);
    }


    /**
     * @OA\Patch(
     *     path="/api/admin/users/{user}/toggle-publish",
     *     summary="Uključi/isključi pravo publikovanja",
     *     description="Menja can_publish status korisnika (samo admin/moderator)",
     *     tags={"Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="user",
     *         in="path",
     *         description="ID korisnika",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="User publishing status updated successfully"),
     *             @OA\Property(property="user", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Ne možete sebi menjati status",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Cannot change your own publishing status")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Nema dozvolu",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unauthorized")
     *         )
     *     )
     * )
     */

    public function togglePublish(User $user)
    {
        $currentUser = auth()->user();
        if (!$currentUser) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Samo admini i moderatori mogu da menjaju publishing status
        if (!in_array($currentUser->role, ['admin', 'moderator'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Moderatori mogu samo obične korisnike da menjaju
        if ($currentUser->role === 'moderator' && $user->role !== 'user') {
            return response()->json(['error' => 'Moderators can only update regular users'], 403);
        }

        // Ne možeš sam sebi da promeniš status
        if ($currentUser->id === $user->id) {
            return response()->json(['error' => 'Cannot change your own publishing status'], 400);
        }

        $user->can_publish = !$user->can_publish;
        $user->save();

        return response()->json([
            'message' => 'User publishing status updated successfully',
            'user' => new UserResource($user->loadCount(['posts', 'likes'])),
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/admin/users/{user}/role",
     *     summary="Promeni ulogu korisnika",
     *     description="Menja ulogu korisnika (samo admin)",
     *     tags={"Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="user",
     *         in="path",
     *         description="ID korisnika",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"role"},
     *             @OA\Property(property="role", type="string", enum={"user", "moderator", "admin"}, example="moderator")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="User role changed from user to moderator"),
     *             @OA\Property(property="user", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Ne možete sebi menjati ulogu",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Cannot change your own role")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Samo admini mogu menjati uloge",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Only admins can change user roles")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Greška pri validaciji"
     *     )
     * )
     */

    public function updateRole(User $user, Request $request)
    {
        $currentUser = auth()->user();
        if (!$currentUser) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Samo admini mogu da menjaju uloge
        if ($currentUser->role !== 'admin') {
            return response()->json(['error' => 'Only admins can change user roles'], 403);
        }

        $request->validate([
            'role' => 'required|in:user,moderator,admin',
        ]);

        // Admin ne može da promeni svoju ulogu
        if ($currentUser->id === $user->id) {
            return response()->json(['error' => 'Cannot change your own role'], 400);
        }

        $oldRole = $user->role;
        $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => "User role changed from {$oldRole} to {$user->role}",
            'user' => new UserResource($user->loadCount(['posts', 'likes'])),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/stats",
     *     summary="Statistika foruma",
     *     description="Vraća osnovne statistike foruma (samo admin/moderator)",
     *     tags={"Admin"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="stats",
     *                 type="object",
     *                 @OA\Property(property="users", type="integer", example=150),
     *                 @OA\Property(property="posts", type="integer", example=520),
     *                 @OA\Property(property="themes", type="integer", example=12),
     *                 @OA\Property(property="likes", type="integer", example=1240),
     *                 @OA\Property(property="recent_users", type="integer", example=15),
     *                 @OA\Property(property="recent_posts", type="integer", example=45)
     *             ),
     *             @OA\Property(property="updated_at", type="string", format="datetime")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Nije autorizovan"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Interna greška servera"
     *     )
     * )
     */

    public function getStats(Request $request)
    {
        // Provera autentifikacije
        $currentUser = $request->user();
        if (!$currentUser || !in_array($currentUser->role, ['admin', 'moderator'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $userCount = User::count();
            $postsCount = \App\Models\Post::count();
            $themesCount = \App\Models\Theme::count();
            $likesCount = \App\Models\Like::count();
            
            // Možete dodati i dodatne statistike
            $recentUsers = User::where('created_at', '>=', now()->subDays(7))->count();
            $recentPosts = \App\Models\Post::where('created_at', '>=', now()->subDays(7))->count();

            return response()->json([
                'success' => true,
                'stats' => [
                    'users' => $userCount,
                    'posts' => $postsCount,
                    'themes' => $themesCount,
                    'likes' => $likesCount,
                    'recent_users' => $recentUsers,
                    'recent_posts' => $recentPosts,
                ],
                'updated_at' => now()->toDateTimeString(),
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Greška pri dobavljanju statistike', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Došlo je do greške pri dobavljanju statistike'
            ], 500);
        }
    }

}