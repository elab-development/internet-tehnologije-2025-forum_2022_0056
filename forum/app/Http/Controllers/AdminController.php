<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
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