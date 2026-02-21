<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{

    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Registracija novog korisnika",
     *     description="Kreira novog korisnika i vraća token",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password"},
     *             @OA\Property(property="name", type="string", example="Marko Marković", description="Ime i prezime"),
     *             @OA\Property(property="email", type="string", format="email", example="marko@example.com", description="Email adresa"),
     *             @OA\Property(property="password", type="string", format="password", example="password123", description="Lozinka (min 8 karaktera)")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Uspešna registracija",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Marko Marković"),
     *                 @OA\Property(property="email", type="string", example="marko@example.com"),
     *                 @OA\Property(property="created_at", type="string", format="datetime"),
     *                 @OA\Property(property="updated_at", type="string", format="datetime")
     *             ),
     *             @OA\Property(property="access_token", type="string", example="1|laravel_sanctum_token_123456789"),
     *             @OA\Property(property="token_type", type="string", example="Bearer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Greška pri validaciji",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="name", type="array", @OA\Items(type="string", example="The name field is required.")),
     *             @OA\Property(property="email", type="array", @OA\Items(type="string", example="The email has already been taken.")),
     *             @OA\Property(property="password", type="array", @OA\Items(type="string", example="The password must be at least 8 characters."))
     *         )
     *     )
     * )
     */

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255|email|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors());
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }



    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Prijava korisnika",
     *     description="Prijavljuje postojećeg korisnika i vraća token",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="marko@example.com", description="Email adresa"),
     *             @OA\Property(property="password", type="string", format="password", example="password123", description="Lozinka")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Uspešna prijava",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Marko Marković logged in"),
     *             @OA\Property(property="access_token", type="string", example="1|laravel_sanctum_token_123456789"),
     *             @OA\Property(property="token_type", type="string", example="Bearer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Neispravni kredencijali",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Wrong credentials")
     *         )
     *     )
     * )
     */

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Wrong credentials'], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => $user->name . ' logged in',
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }


     /**
     * @OA\Post(
     *     path="/api/logout",
     *     summary="Odjava korisnika",
     *     description="Odjavljuje autentifikovanog korisnika i briše token",
     *     tags={"Auth"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Uspešna odjava",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="You have successfully logged out.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Nije autentifikovan",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     )
     * )
     */

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return [
            'message' => 'You have successfully logged out.'
        ];
    }
}
