<?php

namespace Modules\Frontend\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Product;
use App\Models\Service;
use App\Models\Testimonial;
use App\Services\Ecommerce\CartService;
use Illuminate\Http\Request;

class FrontendController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $locale = config('locales.default', 'th');

        return view('frontend::pages.home', [
            'locale' => $locale,
            'sliderBanners' => Banner::query()
                ->where('placement', 'home_slider')
                ->where('is_active', true)
                ->orderBy('sort')
                ->get(),
            'ctaBanner' => Banner::query()
                ->where('placement', 'home_cta')
                ->where('is_active', true)
                ->orderBy('sort')
                ->first(),
            'categories' => Category::query()
                ->where('is_active', true)
                ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
                ->orderBy('sort')
                ->limit(10)
                ->get(),
            'products' => Product::query()
                ->where('is_active', true)
                ->with('category')
                ->orderByDesc('is_featured')
                ->orderBy('sort')
                ->limit(12)
                ->get(),
            'spotlightProduct' => Product::query()
                ->where('is_active', true)
                ->with('category')
                ->orderByDesc('is_featured')
                ->orderBy('sort')
                ->first(),
            'testimonials' => Testimonial::query()
                ->where('is_active', true)
                ->orderBy('sort')
                ->limit(5)
                ->get(),
            'tabCategories' => $this->tabCategoriesWithProducts(),
            'services' => $this->activeServicesQuery()->limit(6)->get(),
        ]);
    }

    public function productShow(string $slug)
    {
        $locale = config('locales.default', 'th');

        $product = Product::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with('category')
            ->firstOrFail();

        $relatedProducts = Product::query()
            ->where('is_active', true)
            ->where('id', '!=', $product->id)
            ->when(
                $product->category_id,
                fn ($query) => $query->where('category_id', $product->category_id)
            )
            ->orderByDesc('is_featured')
            ->orderBy('sort')
            ->limit(8)
            ->get();

        return view('frontend::pages.product-single-1', [
            'locale' => $locale,
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    public function productSingle1()
    {
        $product = Product::query()
            ->where('is_active', true)
            ->orderBy('sort')
            ->firstOrFail();

        return redirect()->route('frontend.product.show', $product->slug);
    }

    public function shopLeftSidebar(?string $category = null)
    {
        $locale = config('locales.default', 'th');

        $categories = Category::query()
            ->where('is_active', true)
            ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
            ->orderBy('sort')
            ->get();

        $activeCategory = null;

        if ($category) {
            $activeCategory = Category::query()
                ->where('slug', $category)
                ->where('is_active', true)
                ->firstOrFail();
        }

        $productsQuery = Product::query()
            ->where('is_active', true)
            ->with('category')
            ->orderByDesc('is_featured')
            ->orderBy('sort');

        if ($activeCategory) {
            $productsQuery->where('category_id', $activeCategory->id);
        }

        $totalProducts = Product::query()->where('is_active', true)->count();

        return view('frontend::pages.shop-left-sidebar', [
            'locale' => $locale,
            'categories' => $categories,
            'activeCategory' => $activeCategory,
            'products' => $productsQuery->paginate(12)->withQueryString(),
            'totalProducts' => $totalProducts,
        ]);
    }

    public function shoppingCart()
    {
        $cart = app(CartService::class)->getOrCreate(request());

        return view('frontend::pages.shopping-cart', [
            'locale' => config('locales.default', 'th'),
            'tabCategories' => $this->tabCategoriesWithProducts(),
            'cart' => $cart,
        ]);
    }

    public function checkout()
    {
        $cart = app(CartService::class)->getOrCreate(request());

        if ($cart->items->isEmpty()) {
            return redirect()->route('frontend.shopping-cart')
                ->withErrors(['cart' => 'Your cart is empty.']);
        }

        return view('frontend::pages.check-out', [
            'cart' => $cart,
        ]);
    }

    public function blogGrid()
    {
        $locale = config('locales.default', 'th');

        return view('frontend::pages.blog-grid', [
            'locale' => $locale,
            'blogPosts' => $this->publishedBlogPostsQuery()->paginate(9)->withQueryString(),
        ]);
    }

    public function blogShow(string $slug)
    {
        $locale = config('locales.default', 'th');

        $post = $this->publishedBlogPostsQuery()
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedPosts = $this->publishedBlogPostsQuery()
            ->where('id', '!=', $post->id)
            ->limit(6)
            ->get();

        return view('frontend::pages.blog-post-2', [
            'locale' => $locale,
            'post' => $post,
            'relatedPosts' => $relatedPosts,
        ]);
    }

    public function blogPost2()
    {
        $post = $this->publishedBlogPostsQuery()->firstOrFail();

        return redirect()->route('frontend.blog.show', $post->slug);
    }

    /**
     * Active categories that have at least one active product (for home tab sliders).
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, Category>
     */
    protected function tabCategoriesWithProducts()
    {
        return Category::query()
            ->where('is_active', true)
            ->whereHas('products', fn ($query) => $query->where('is_active', true))
            ->with(['products' => function ($query) {
                $query->where('is_active', true)
                    ->with('category')
                    ->orderByDesc('is_featured')
                    ->orderBy('sort')
                    ->limit(12);
            }])
            ->orderBy('sort')
            ->get();
    }

    protected function publishedBlogPostsQuery()
    {
        return BlogPost::query()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->orderByDesc('published_at')
            ->orderBy('sort');
    }

    public function about()
    {
        $locale = config('locales.default', 'th');

        return view('frontend::pages.about', [
            'locale' => $locale,
            'services' => $this->activeServicesQuery()->limit(8)->get(),
        ]);
    }

    public function contact()
    {
        return view('frontend::pages.contact');
    }

    public function servicesIndex()
    {
        $locale = config('locales.default', 'th');

        return view('frontend::pages.our-service-1', [
            'locale' => $locale,
            'services' => $this->activeServicesQuery()->get(),
        ]);
    }

    public function servicesShow(string $slug)
    {
        $locale = config('locales.default', 'th');

        $service = $this->activeServicesQuery()
            ->where('slug', $slug)
            ->firstOrFail();

        return view('frontend::pages.service-detail', [
            'locale' => $locale,
            'service' => $service,
            'services' => $this->activeServicesQuery()->get(),
        ]);
    }

    public function servicesDetail()
    {
        $service = $this->activeServicesQuery()->firstOrFail();

        return redirect()->route('frontend.services.show', $service->slug);
    }

    protected function activeServicesQuery()
    {
        return Service::query()
            ->where('is_active', true)
            ->orderBy('sort');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('frontend::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) {}

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('frontend::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('frontend::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id) {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {}
}
