@php
    $locale = $locale ?? config('locales.default', 'th');
@endphp

@if (($relatedProducts ?? collect())->isNotEmpty())
    <div class="flat-spacing flat-animate-tab">
        <div class="container">
            <h2 class="sect-head text-center text-primary wow fadeInUp mb-4">Related Products</h2>
            <div dir="ltr" class="swiper tf-swiper wow fadeInUp" data-preview="4" data-tablet="3" data-mobile-sm="2"
                data-mobile="2" data-space="10" data-pagination="2" data-pagination-sm="2" data-pagination-md="3"
                data-pagination-lg="4">
                <div class="swiper-wrapper">
                    @foreach ($relatedProducts as $related)
                        @php
                            $displayPrice = $related->sale_price ?? $related->price;
                        @endphp
                        <div class="swiper-slide">
                            <div class="card-product">
                                <div class="card-product_wrapper">
                                    <a href="{{ route('frontend.product.show', $related->slug) }}" class="product-img">
                                        <img class="img-product" width="300" height="300"
                                            src="{{ $related->mediaUrl(fallback: asset('assets/images/product/product-15.jpg')) }}"
                                            alt="{{ $related->getTranslation('name', $locale) }}">
                                    </a>
                                </div>
                                <div class="card-product_info">
                                    <div class="product_info_wrap">
                                        <div class="price-wrap">
                                            <span class="price-new text-primary fw-medium lh-28">
                                                ฿{{ number_format((float) $displayPrice, 2) }}
                                            </span>
                                        </div>
                                        <a href="{{ route('frontend.product.show', $related->slug) }}"
                                            class="name-product lh-28 fw-medium link-underline text-primary">
                                            {{ $related->getTranslation('name', $locale) }}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
@endif
