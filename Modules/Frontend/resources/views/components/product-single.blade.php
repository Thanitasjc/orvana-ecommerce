@php
    $locale = $locale ?? config('locales.default', 'th');
    $galleryImages = isset($product) ? $product->galleryImages() : [];
    if (empty($galleryImages) && isset($product)) {
        $galleryImages = [null];
    }
    $displayPrice = isset($product) ? ($product->sale_price ?? $product->price) : null;
    $hasDiscount = isset($product) && $product->sale_price && $product->sale_price < $product->price;
@endphp

<section class="section-product-single flat-spacing tf-main-product section-image-zoom pb-0">
    <div class="container">
        <div class="row">
            <div class="col-lg-6">
                <div class="tf-product-media-wrap sticky-top">
                    <div class="product-thumbs-slider style-row row_left">
                        <div class="flat-wrap-media-product">
                            <div dir="ltr" class="swiper tf-product-media-main" id="gallery-swiper-started">
                                <div class="swiper-wrapper">
                                    @foreach ($galleryImages as $imagePath)
                                        @php
                                            $imageUrl = $imagePath
                                                ? $product->mediaUrl($imagePath)
                                                : asset('assets/images/product/product-13.jpg');
                                        @endphp
                                        <div class="swiper-slide">
                                            <a href="{{ $imageUrl }}" target="_blank" class="item"
                                                data-pswp-width="1000" data-pswp-height="1000">
                                                <img loading="lazy" width="615" height="615" class="tf-image-zoom"
                                                    data-zoom="{{ $imageUrl }}" src="{{ $imageUrl }}"
                                                    alt="{{ $product->getTranslation('name', $locale) }}">
                                            </a>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                        @if (count($galleryImages) > 1)
                            <div dir="ltr" class="swiper tf-product-media-thumbs other-image-zoom"
                                data-direction="vertical" data-preview="3">
                                <div class="swiper-wrapper stagger-wrap">
                                    @foreach ($galleryImages as $imagePath)
                                        @php
                                            $thumbUrl = $imagePath
                                                ? $product->mediaUrl($imagePath)
                                                : asset('assets/images/product/product-13.jpg');
                                        @endphp
                                        <div class="swiper-slide stagger-item">
                                            <div class="item">
                                                <img loading="lazy" width="80" height="80" src="{{ $thumbUrl }}"
                                                    alt="Image">
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="tf-zoom-main sticky-top"></div>
                <div class="tf-product-info-wrap position-relative other-image-zoom">
                    <div class="tf-product-info-heading">
                        <div class="product-info-meta">
                            @if ($product->category)
                                <p class="infor_cate fw-semibold">
                                    {{ strtoupper($product->category->getTranslation('name', $locale)) }}
                                </p>
                                <div class="br-line type-vertical"></div>
                            @endif
                        </div>
                        <h3 class="product-infor-name text-primary">
                            {{ $product->getTranslation('name', $locale) }}
                        </h3>
                        <div class="product-infor-price">
                            <h2 class="text-primary price-on-sale">
                                ฿{{ number_format((float) $displayPrice, 2) }}
                            </h2>
                            @if ($hasDiscount)
                                <p class="text-body-large cl-text-2 text-decoration-line-through">
                                    ฿{{ number_format((float) $product->price, 2) }}
                                </p>
                            @endif
                        </div>
                        @if ($product->getTranslation('short_description', $locale))
                            <p class="product-infor-desc">
                                {{ $product->getTranslation('short_description', $locale) }}
                            </p>
                        @endif
                    </div>
                    <div class="tf-product-variant">
                        <div class="variant-quantity">
                            <div class="variant-picker-label">
                                <div class="text-body-large text-primary">Quantity:</div>
                            </div>
                            <div class="wg-quantity">
                                <button type="button" class="btn-quantity btn-decrease">
                                    <i class="icon icon-minus"></i>
                                </button>
                                <input class="quantity-product" type="text" name="number" value="1">
                                <button type="button" class="btn-quantity btn-increase">
                                    <i class="icon icon-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="tf-product-total-btn">
                        <div class="group-btn">
                            <form method="POST" action="{{ route('frontend.cart.items.add') }}" class="w-100">
                                @csrf
                                <input type="hidden" name="product_id" value="{{ $product->id }}">
                                <input type="hidden" name="quantity" id="single-product-qty" value="1">
                                <button type="submit"
                                    class="tf-btn style-btn-fill-sec animate-btn animate-dark w-100 border-0">
                                    <span class="fw-semibold">Add To Cart -
                                        <span class="price-add">฿{{ number_format((float) $displayPrice, 2) }}</span>
                                    </span>
                                </button>
                            </form>
                        </div>
                        <a href="{{ route('frontend.checkout') }}" class="tf-btn style-btn-fill-pri animate-btn">
                            <span class="fw-semibold">Buy It Now</span>
                        </a>
                    </div>
                    <ul class="tf-product-additional text-caption-01">
                        @if ($product->sku)
                            <li>
                                <span class="text-primary">SKU:</span>
                                {{ $product->sku }}
                            </li>
                        @endif
                        @if ($product->category)
                            <li>
                                <span class="text-primary">Categories:</span>
                                {{ $product->category->getTranslation('name', $locale) }}
                            </li>
                        @endif
                        <li>
                            <span class="text-primary">Available:</span>
                            Instock
                        </li>
                    </ul>
                    <div class="tf-product-how-payment">
                        <p class="lh-28 text-primary">Guranteed safe checkout:</p>
                        <ul class="payment-method-list">
                            <li><img loading="lazy" width="50" height="32"
                                    src="{{ asset('assets/images/payment/pay-visa.svg') }}" alt=""></li>
                            <li><img loading="lazy" width="50" height="32"
                                    src="{{ asset('assets/images/payment/pay-master.svg') }}" alt=""></li>
                            <li><img loading="lazy" width="50" height="32"
                                    src="{{ asset('assets/images/payment/pay-paypal.svg') }}" alt=""></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
