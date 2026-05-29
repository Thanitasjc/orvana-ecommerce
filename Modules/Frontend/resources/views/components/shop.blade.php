<section class="flat-spacing">
    <div class="container">
        <div class="row">
            <div class="col-xl-3">
                <div class="canvas-sidebar sidebar-filter canvas-filter left">
                    <div class="canvas-wrapper">
                        <div class="canvas-header d-xl-none">
                            <span class="title h4 fw-medium text-primary">Filter</span>
                            <span class="icon-close link icon-close-popup close-filter"></span>
                        </div>
                        <div class="canvas-body p-xl-0">
                            <div class="widget-facet">
                                <div class="facet-title" data-bs-target="#category" role="button"
                                    data-bs-toggle="collapse" aria-expanded="true" aria-controls="category">
                                    <h6>Product Categories</h6>
                                    <span class="icon icon-caret-down"></span>
                                </div>
                                <div id="category" class="collapse show">
                                    <ul class="collapse-body filter-group-check current-scrollbar">
                                        <li class="list-item">
                                            <a href="{{ route('frontend.shop.left-sidebar') }}"
                                                class="label d-flex justify-content-between align-items-center {{ empty($activeCategory) ? 'fw-semibold text-primary' : '' }}">
                                                <span class="cate-text">All Products</span>
                                                <span class="count">({{ $totalProducts ?? $products->total() }})</span>
                                            </a>
                                        </li>
                                        @foreach ($categories as $category)
                                            <li class="list-item">
                                                <a href="{{ route('frontend.shop.left-sidebar', $category->slug) }}"
                                                    class="label d-flex justify-content-between align-items-center {{ ($activeCategory->id ?? null) === $category->id ? 'fw-semibold text-primary' : '' }}">
                                                    <span class="cate-text">
                                                        {{ $category->getTranslation('name', $locale) }}
                                                    </span>
                                                    <span class="count">({{ $category->products_count }})</span>
                                                </a>
                                            </li>
                                        @endforeach
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-9">
                <div class="tf-shop-control mb-4">
                    <button type="button" id="filterShop" class="tf-btn-filter d-xl-none">
                        <span class="icon icon-SlidersHorizontal"></span>
                        <span class="text">Show All Filter</span>
                    </button>
                    <p class="text-caption-01 text-primary mb-0">
                        @if ($activeCategory ?? null)
                            {{ $activeCategory->getTranslation('name', $locale) }} —
                        @endif
                        {{ $products->total() }} products
                    </p>
                </div>

                <div class="wrapper-control-shop">
                    @if ($products->isNotEmpty())
                        <div class="tf-grid-layout tf-col-3 wrapper-shop">
                            @foreach ($products as $product)
                                @include('frontend::components.partials.shop-product-card', [
                                    'product' => $product,
                                    'locale' => $locale,
                                ])
                            @endforeach
                        </div>
                        <div class="mt-4">
                            {{ $products->withQueryString()->links() }}
                        </div>
                    @else
                        <div class="text-center py-5">
                            <p class="text-primary h5 mb-2">No products in this category yet.</p>
                            <a href="{{ route('frontend.shop.left-sidebar') }}" class="tf-btn style-btn-fill-sec animate-btn animate-dark">
                                View all products
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</section>
