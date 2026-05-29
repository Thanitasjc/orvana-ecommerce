@php
    $locale = $locale ?? config('locales.default', 'th');
    $tabCategories = $tabCategories ?? collect();
@endphp

@if ($tabCategories->isNotEmpty())
    <div class="flat-spacing flat-animate-tab">
        <div class="container-full">
            <ul class="tab-btn-wrap-1 justify-content-md-center wow fadeInUp" role="tablist">
                @foreach ($tabCategories as $category)
                    <li class="nav-tab-item" role="presentation">
                        <a href="#category-{{ $category->slug }}" data-bs-toggle="tab"
                            class="tf-btn-tab {{ $loop->first ? 'active' : '' }}" role="tab"
                            @if ($loop->first) aria-selected="true" @endif>
                            <span class="h3 fw-medium">
                                {{ $category->getTranslation('name', $locale) }}
                            </span>
                        </a>
                    </li>
                @endforeach
            </ul>
            <div class="tab-content">
                @foreach ($tabCategories as $category)
                    <div class="tab-pane {{ $loop->first ? 'active show' : '' }} fade"
                        id="category-{{ $category->slug }}" role="tabpanel">
                        <div class="swiper tf-swiper wow fadeInUp" data-preview="4" data-tablet="3"
                            data-mobile-sm="2" data-mobile="2" data-space-lg="10" data-space-md="10"
                            data-space="10" data-pagination="2" data-pagination-sm="2" data-pagination-md="3"
                            data-pagination-lg="4">
                            <div class="swiper-wrapper">
                                @forelse ($category->products as $product)
                                    @include('frontend::components.partials.product-card-swiper', [
                                        'product' => $product,
                                        'locale' => $locale,
                                    ])
                                @empty
                                    <div class="swiper-slide">
                                        <p class="text-primary p-4">ยังไม่มีสินค้าในหมวดนี้</p>
                                    </div>
                                @endforelse
                            </div>
                            <div class="sw-dot-default style-small tf-sw-pagination"></div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
@endif
