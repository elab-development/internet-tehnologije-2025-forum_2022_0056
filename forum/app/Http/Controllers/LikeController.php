<?php

namespace App\Http\Controllers;

use App\Http\Resources\LikeResource;
use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{

    /**
     * @OA\Get(
     *     path="/api/likes",
     *     summary="Lista lajkova korisnika",
     *     description="Vraća listu lajkova za autentifikovanog korisnika (admin/moderator mogu videti i druge korisnike)",
     *     tags={"Likes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="user_id",
     *         in="query",
     *         description="ID korisnika (samo za admin/moderator)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Broj lajkova po stranici (5-100)",
     *         required=false,
     *         @OA\Schema(type="integer", default=50)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(property="user_id", type="integer"),
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
     *         response=401,
     *         description="Nije autentifikovan"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Greška pri validaciji"
     *     )
     * )
     */
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'user_id' => 'sometimes|integer|exists:users,id',
            'per_page' => 'sometimes|integer|min:5|max:100',
        ]);

        $targetUserId = $user->id;
        if (in_array($user->role, ['admin', 'moderator'], true) && $request->filled('user_id')) {
            $targetUserId = (int) $validated['user_id'];
        }

        $perPage = (int) ($validated['per_page'] ?? 50);

        $likes = Like::query()
            ->where('user_id', $targetUserId)
            ->with([
                'user',
                'post' => function ($q) {
                    $q->with(['author', 'theme'])
                        ->withCount(['likes', 'replies']);
                },
            ])
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'user_id' => $targetUserId,
            'likes' => LikeResource::collection($likes),
            'meta' => [
                'current_page' => $likes->currentPage(),
                'per_page' => $likes->perPage(),
                'total' => $likes->total(),
                'last_page' => $likes->lastPage(),
            ],
        ]);
    }


    /**
     * @OA\Post(
     *     path="/api/posts/{post}/like",
     *     summary="Lajkuj post",
     *     description="Lajkuje određeni post",
     *     tags={"Likes"},
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
     *         description="Uspešno lajkovano",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Liked"),
     *             @OA\Property(property="liked", type="boolean", example=true),
     *             @OA\Property(property="post_id", type="integer"),
     *             @OA\Property(property="likes_count", type="integer"),
     *             @OA\Property(property="replies_count", type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     )
     * )
     */

    public function like(Post $post)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        Like::firstOrCreate([
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $post->loadCount(['likes', 'replies']);

        return response()->json([
            'message' => 'Liked',
            'liked' => true,
            'post_id' => $post->id,
            'likes_count'  => $post->likes_count,
            'replies_count' => $post->replies_count,
        ]);
    }


    /**
     * @OA\Delete(
     *     path="/api/posts/{post}/like",
     *     summary="Ukloni lajk",
     *     description="Uklanja lajk sa posta",
     *     tags={"Likes"},
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
     *         description="Uspešno uklonjen lajk",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unliked"),
     *             @OA\Property(property="liked", type="boolean", example=false),
     *             @OA\Property(property="post_id", type="integer"),
     *             @OA\Property(property="likes_count", type="integer"),
     *             @OA\Property(property="replies_count", type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     )
     * )
     */

    public function unlike(Post $post)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        Like::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->delete();

        $post->loadCount(['likes', 'replies']);

        return response()->json([
            'message' => 'Unliked',
            'liked' => false,
            'post_id' => $post->id,
            'likes_count' => $post->likes_count,
            'replies_count' => $post->replies_count,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/posts/{post}/like/check",
     *     summary="Proveri lajk",
     *     description="Proverava da li je korisnik lajkovao post",
     *     tags={"Likes"},
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
     *         description="Uspešno",
     *         @OA\JsonContent(
     *             @OA\Property(property="post_id", type="integer"),
     *             @OA\Property(property="is_liked", type="boolean", example=true),
     *             @OA\Property(property="likes_count", type="integer", example=5)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan"
     *     )
     * )
     */

    public function checkLike(Post $post)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $isLiked = Like::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->exists();

        return response()->json([
            'post_id' => $post->id,
            'is_liked' => $isLiked,
            'likes_count' => $post->likes()->count(),
        ]);
    }

}
