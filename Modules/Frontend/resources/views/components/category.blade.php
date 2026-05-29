<section class="section-category flat-spacing-2 bg-surface">
    <div class="container-full">
        <h2 class="sect-head text-center text-primary wow fadeInUp">
            Featured Categories
        </h2>
        <div dir="ltr" class="swiper tf-swiper wow fadeInUp" data-preview="5" data-tablet="4" data-mobile-sm="3"
            data-mobile="2" data-space-lg="20" data-space-md="20" data-space="12" data-pagination="2"
            data-pagination-sm="3" data-pagination-md="4" data-pagination-lg="5">
            <div class="swiper-wrapper">
                @forelse ($categories ?? [] as $category)
                    <div class="swiper-slide">
                        <a href="{{ route('frontend.shop.left-sidebar', $category->slug) }}" class="category-v01">
                            <div class="cate-image">
                                <img loading="lazy" width="280" height="280"
                                    src="{{ $category->mediaUrl(fallback: asset('assets/images/category/cate-1.png')) }}"
                                    alt="{{ $category->getTranslation('name', $locale ?? 'th') }}">
                            </div>
                            <div class="cate-info">
                                <p class="h5 fw-medium info_name text-primary link-underline">
                                    {{ $category->getTranslation('name', $locale ?? 'th') }}
                                </p>
                                <p class="info_quanity text-caption-01">
                                    {{ $category->products_count }} Products
                                </p>
                            </div>
                        </a>
                    </div>
                @empty
                    <div class="swiper-slide">
                        <a href="{{ route('frontend.shop.left-sidebar') }}" class="category-v01">
                            <div class="cate-image">
                                <img loading="lazy" width="280" height="280"
                                    src="{{ asset('assets/images/category/cate-1.png') }}" alt="Category">
                            </div>
                            <div class="cate-info">
                                <p class="h5 fw-medium info_name text-primary link-underline">Vegetables</p>
                                <p class="info_quanity text-caption-01">0 Products</p>
                            </div>
                        </a>
                    </div>
                @endforelse
            </div>
        </div>
    </div>
</section>
