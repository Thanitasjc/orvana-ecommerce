<?php

namespace Modules\Frontend\Providers;

use App\Models\Category;
use Illuminate\Support\Facades\View;
use Nwidart\Modules\Support\ModuleServiceProvider;

class FrontendServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'Frontend';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'frontend';

    /**
     * Command classes to register.
     *
     * @var string[]
     */
    // protected array $commands = [];

    /**
     * Provider classes to register.
     *
     * @var string[]
     */
    protected array $providers = [
        EventServiceProvider::class,
        RouteServiceProvider::class,
    ];

    public function boot(): void
    {
        parent::boot();

        View::composer('frontend::components.footer', function ($view) {
            $view->with(
                'footerCategories',
                Category::query()
                    ->where('is_active', true)
                    ->orderBy('sort')
                    ->limit(6)
                    ->get()
            );
        });
    }
}
