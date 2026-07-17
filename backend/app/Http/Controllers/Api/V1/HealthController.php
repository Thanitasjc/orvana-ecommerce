<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HealthController extends Controller
{
    public const BUILD_ID = '2026-07-17-s3-diag';

    public function show(): JsonResponse
    {
        return response()->json([
            'ok' => true,
            'build' => self::BUILD_ID,
        ]);
    }

    public function s3Diagnostic(Request $request): JsonResponse
    {
        if ($request->query('key') !== 's3diag-2026') {
            abort(404);
        }

        $disk = config('filesystems.uploads');
        $path = 'diag/'.uniqid('test_', true).'.txt';

        try {
            Storage::disk($disk)->put($path, 'hello '.now()->toIso8601String());
            $url = Storage::disk($disk)->url($path);

            return response()->json([
                'ok' => true,
                'disk' => $disk,
                'path' => $path,
                'url' => $url,
            ]);
        } catch (\Throwable $e) {
            $previous = $e->getPrevious();

            return response()->json([
                'ok' => false,
                'disk' => $disk,
                'error_class' => $e::class,
                'error' => $e->getMessage(),
                'previous_class' => $previous ? $previous::class : null,
                'previous' => $previous?->getMessage(),
            ], 500);
        }
    }
}
