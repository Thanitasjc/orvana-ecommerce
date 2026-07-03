#!/usr/bin/env bash
set -e

php artisan migrate --force
php artisan storage:link || true
php artisan config:cache
php artisan route:cache

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
