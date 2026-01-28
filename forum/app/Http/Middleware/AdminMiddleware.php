<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        if (!in_array(auth()->user()->role, ['admin', 'moderator'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}