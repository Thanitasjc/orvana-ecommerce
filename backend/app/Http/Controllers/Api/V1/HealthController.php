<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HealthController extends Controller
{
    public const BUILD_ID = '2026-07-17-s3-diag2';

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

        $key = (string) config('filesystems.disks.s3.key');
        $secret = (string) config('filesystems.disks.s3.secret');
        $cfg = [
            'access_key_id' => $key,
            'access_key_len' => strlen($key),
            'secret_len' => strlen($secret),
            'region' => config('filesystems.disks.s3.region'),
            'bucket' => config('filesystems.disks.s3.bucket'),
            'endpoint' => config('filesystems.disks.s3.endpoint'),
            'use_path_style_endpoint' => config('filesystems.disks.s3.use_path_style_endpoint'),
        ];

        try {
            Storage::disk($disk)->put($path, 'hello '.now()->toIso8601String());
            $url = Storage::disk($disk)->url($path);

            return response()->json([
                'ok' => true,
                'disk' => $disk,
                'path' => $path,
                'url' => $url,
                'config' => $cfg,
            ]);
        } catch (\Throwable $e) {
            $previous = $e->getPrevious();

            return response()->json([
                'ok' => false,
                'disk' => $disk,
                'config' => $cfg,
                'error_class' => $e::class,
                'error' => $e->getMessage(),
                'previous_class' => $previous ? $previous::class : null,
                'previous' => $previous?->getMessage(),
            ], 500);
        }
    }
}
