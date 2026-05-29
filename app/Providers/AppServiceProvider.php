<?php

namespace App\Providers;

use Filament\Forms\Components\FileUpload;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::useBootstrapFive();

        FileUpload::configureUsing(function (FileUpload $component): void {
            $component
                ->disk('public')
                ->visibility('public')
                ->fetchFileInformation(false);
        });
    }
}
