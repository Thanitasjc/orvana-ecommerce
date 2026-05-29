<section class="flat-spacing">
    <div class="container">
        <h2 class="sect-head text-center text-primary wow fadeInUp">
            Fresh From The Field
        </h2>
        <div dir="ltr" class="swiper tf-swiper wow fadeInUp" data-preview="3" data-tablet="3" data-mobile-sm="2"
            data-mobile="2" data-space="10" data-pagination="2" data-pagination-sm="2" data-pagination-md="3"
            data-pagination-lg="3">
            <div class="swiper-wrapper">
                @forelse ($products ?? [] as $product)
                    @php
                        $displayPrice = $product->sale_price ?? $product->price;
                        $hasDiscount = $product->sale_price && $product->sale_price < $product->price;
                        $discountPercent = $hasDiscount && $product->price > 0
                            ? round((1 - ($product->sale_price / $product->price)) * 100)
                            : null;
                    @endphp
                    <div class="swiper-slide">
                        <div class="card-product">
                            <div class="card-product_wrapper">
                                <a href="{{ route('frontend.product.show', $product->slug) }}" class="product-img">
                                    <img class="img-product" width="300" height="300"
                                        src="{{ $product->mediaUrl(fallback: asset('assets/images/product/product-15.jpg')) }}"
                                        alt="{{ $product->getTranslation('name', $locale ?? 'th') }}">
                                </a>
                                @if ($hasDiscount && $discountPercent)
                                    <ul class="list-badge">
                                        <li class="badge-sale text-caption-02">
                                            -{{ $discountPercent }}%
                                        </li>
                                    </ul>
                                @endif
                                <ul class="product-action_list">
                                    <li class="wishlist">
                                        <a href="javascript:void(0);" class="hover-tooltip tooltip-left box-icon">
                                            <span class="icon icon-heart-stroke"></span>
                                            <span class="tooltip">Add to Wishlist</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#quickView" data-bs-toggle="offcanvas"
                                            class="hover-tooltip tooltip-left box-icon">
                                            <span class="icon icon-eye"></span>
                                            <span class="tooltip">Quick view</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div class="card-product_info">
                                <div class="product_info_wrap">
                                    <div class="price-wrap">
                                        <span class="price-new text-primary fw-medium lh-28">
                                            ฿{{ number_format((float) $displayPrice, 2) }}
                                        </span>
                                        @if ($hasDiscount)
                                            <span class="price-old text-caption-01">
                                                ฿{{ number_format((float) $product->price, 2) }}
                                            </span>
                                        @endif
                                    </div>
                                    <a href="{{ route('frontend.product.show', $product->slug) }}"
                                        class="name-product lh-28 fw-medium link-underline text-primary">
                                        {{ $product->getTranslation('name', $locale ?? 'th') }}
                                    </a>
                                    @if ($product->category)
                                        <p class="product-cate text-caption-02 fw-medium">
                                            {{ strtoupper($product->category->getTranslation('name', $locale ?? 'th')) }}
                                        </p>
                                    @endif
                                </div>
                                <div class="btn-add-to-card">
                                    <span class="text text-1 text-caption-01">Add To Cart</span>
                                    <span class="text text-2 text-caption-01">View Product</span>
                                </div>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="swiper-slide">
                        <div class="card-product">
                            <div class="card-product_wrapper">
                                <a href="{{ route('frontend.shop.left-sidebar') }}" class="product-img">
                                    <img class="img-product" width="300" height="300"
                                        src="{{ asset('assets/images/product/product-15.jpg') }}" alt="Product">
                                </a>
                            </div>
                            <div class="card-product_info">
                                <p class="name-product lh-28 fw-medium text-primary">No products yet</p>
                            </div>
                        </div>
                    </div>
                @endforelse
            </div>
        </div>
    </div>
</section>
