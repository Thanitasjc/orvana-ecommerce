<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public const BUILD_ID = '2026-07-15-pgsql-bool';

    public function show(): JsonResponse
    {
        return response()->json([
            'ok' => true,
            'build' => self::BUILD_ID,
        ]);
    }
}
