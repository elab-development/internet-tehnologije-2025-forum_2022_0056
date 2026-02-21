<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{

    /**
     * @OA\Patch(
     *     path="/api/users/{user}/toggle-publish",
     *     summary="Uključi/isključi pravo publikovanja",
     *     description="Menja can_publish status korisnika (samo admin/moderator)",
     *     tags={"Users"},
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
     *             @OA\Property(property="message", type="string", example="User can_publish toggled successfully"),
     *             @OA\Property(property="user", type="object")
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
     *             @OA\Property(property="error", type="string", example="Only admins and moderators can change publishing rights")
     *         )
     *     )
     * )
     */

    public function toggleCanPublish(User $user)
    {
        $actor = Auth::user();
        if (!$actor) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        if (!in_array($actor->role, ['admin', 'moderator'], true)) {
            return response()->json(['error' => 'Only admins and moderators can change publishing rights'], 403);
        }

        if ($actor->role === 'moderator' && $user->role !== 'user') {
            return response()->json(['error' => 'Moderators can only update regular users'], 403);
        }

        $user->can_publish = !$user->can_publish;
        $user->save();

        return response()->json([
            'message' => 'User can_publish toggled successfully',
            'user' => new UserResource($user),
        ]);
    }
}
