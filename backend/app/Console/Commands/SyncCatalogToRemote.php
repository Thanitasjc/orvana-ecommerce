<?php

namespace App\Console\Commands;

use App\Services\CatalogSyncService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncCatalogToRemote extends Command
{
  protected $signature = 'catalog:sync-remote
        {--source=sqlite : Local database connection name}
        {--dry-run : Preview sync without writing to remote}
        {--with-customers : Also sync customers table}';

  protected $description = 'Sync categories, products, and variations from local DB to remote Supabase';

  public function handle(): int
  {
    $this->configureRemoteConnection();

    $source = (string) $this->option('source');
    $dryRun = (bool) $this->option('dry-run');
    $withCustomers = (bool) $this->option('with-customers');

    if (! env('REMOTE_DATABASE_URL')) {
      $this->error('REMOTE_DATABASE_URL is not set. Use scripts/sync-to-supabase.ps1 or set it in the environment.');

      return self::FAILURE;
    }

    try {
      DB::connection($source)->getPdo();
      $this->info("Source connection [{$source}] OK");
    } catch (\Throwable $e) {
      $this->error("Cannot connect to source [{$source}]: {$e->getMessage()}");

      return self::FAILURE;
    }

    try {
      DB::connection('remote')->getPdo();
      $schema = config('database.connections.remote.search_path');
      DB::connection('remote')->statement('SET search_path TO "'.$schema.'"');
      $this->info("Remote connection [remote] OK (schema: {$schema})");
    } catch (\Throwable $e) {
      $this->error("Cannot connect to remote Supabase: {$e->getMessage()}");

      return self::FAILURE;
    }

    if ($dryRun) {
      $this->warn('Dry run — no remote writes.');
    }

    $service = new CatalogSyncService($source, 'remote');
    $stats = $service->sync($dryRun, $withCustomers);

    $this->newLine();
    $this->table(
      ['Item', 'Count'],
      [
        ['Categories', $stats['categories']],
        ['Products', $stats['products']],
        ['Variations', $stats['variations']],
        ['Images copied to frontend', $stats['images']],
      ],
    );

    if ($stats['images'] > 0 && ! $dryRun) {
      $this->newLine();
      $this->comment('Uploaded product images were copied to frontend/public/assets/img/product/synced/');
      $this->comment('Redeploy Vercel so production can serve the new images.');
    }

    $this->info($dryRun ? 'Dry run complete.' : 'Catalog sync complete.');

    return self::SUCCESS;
  }

  private function configureRemoteConnection(): void
  {
    $schema = env('REMOTE_DB_SCHEMA', 'aesthete');

    config([
      'database.connections.remote' => [
        'driver' => 'pgsql',
        'url' => env('REMOTE_DATABASE_URL'),
        'charset' => env('DB_CHARSET', 'utf8'),
        'prefix' => '',
        'prefix_indexes' => true,
        'search_path' => $schema,
        'sslmode' => env('REMOTE_DB_SSLMODE', 'require'),
        'options' => extension_loaded('pdo_pgsql') ? [
          \PDO::ATTR_EMULATE_PREPARES => true,
        ] : [],
      ],
    ]);

    DB::purge('remote');
  }
}
