<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'member' => \App\Http\Middleware\EnsureMember::class,
            'staff' => \App\Http\Middleware\EnsureStaff::class,
            'staff.role' => \App\Http\Middleware\EnsureStaffRole::class,
        ]);

        // Bearer token API — ไม่ใช้ Sanctum stateful/CSRF (Next.js ส่ง Authorization header)
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
