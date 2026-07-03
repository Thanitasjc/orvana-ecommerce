#!/usr/bin/env bash
set -e

php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; \$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap(); Illuminate\Support\Facades\DB::statement('CREATE SCHEMA IF NOT EXISTS ' . (env('DB_SCHEMA') ?: 'public'));" || true

php artisan migrate --force
php artisan storage:link || true
php artisan config:cache
php artisan route:cache

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
