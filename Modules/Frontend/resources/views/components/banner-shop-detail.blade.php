@php
    $locale = $locale ?? config('locales.default', 'th');
    $product = $spotlightProduct ?? null;
    $fallbackImage = asset('assets/images/product/detail/detail-1.jpg');
@endphp

@if ($product)
    @php
        $galleryImages = $product->galleryImages();
        $imageOne = isset($galleryImages[0])
            ? $product->mediaUrl($galleryImages[0])
            : $product->mediaUrl(fallback: $fallbackImage);
        $imageTwo = isset($galleryImages[1])
            ? $product->mediaUrl($galleryImages[1])
            : (isset($galleryImages[0])
                ? $product->mediaUrl($galleryImages[0])
                : $product->mediaUrl(fallback: asset('assets/images/product/detail/detail-2.jpg')));
        $displayPrice = $product->sale_price ?? $product->price;
        $hasDiscount = $product->sale_price && $product->sale_price < $product->price;
        $productUrl = route('frontend.product.show', $product->slug);
        $productName = $product->getTranslation('name', $locale);
        $productDesc = $product->getTranslation('short_description', $locale)
            ?: $product->getTranslation('description', $locale);
    @endphp
    <div class="secion-banner-shop-detail flat-spacing pb-0">
        <div class="container">
            <div class="banner-shop-detail wow fadeInUp">
                <div class="image-list tf-grid-layout sm-col-2">
                    <div class="image">
                        <img loading="lazy" width="420" height="420" src="{{ $imageOne }}"
                            alt="{{ $productName }}">
                    </div>
                    <div class="image">
                        <img loading="lazy" width="420" height="420" src="{{ $imageTwo }}"
                            alt="{{ $productName }}">
                    </div>
                </div>
                <div class="content">
                    <div class="product-info-meta">
                        @if ($product->category)
                            <p class="infor_cate fw-semibold text-label">
                                {{ strtoupper($product->category->getTranslation('name', $locale)) }}
                            </p>
                            <div class="br-line type-vertical"></div>
                        @endif
                    </div>
                    <a href="{{ $productUrl }}"
                        class="text-primary h4 fw-medium link-underline product-infor-name">
                        {{ $productName }}
                    </a>
                    <p class="h4 fw-medium product-infor-price text-primary">
                        ฿{{ number_format((float) $displayPrice, 2) }}
                        @if ($hasDiscount)
                            <span class="text-caption-01 text-decoration-line-through ms-2">
                                ฿{{ number_format((float) $product->price, 2) }}
                            </span>
                        @endif
                    </p>
                    @if ($productDesc)
                        <p class="product-infor-desc">
                            {{ \Illuminate\Support\Str::limit(strip_tags($productDesc), 200) }}
                        </p>
                    @endif
                    <div class="br-line d-flex"></div>
                    <div class="variant-quantity">
                        <div class="variant-picker-label">
                            <div class="text-body-large text-primary">
                                Quantity:
                            </div>
                        </div>
                        <div class="quantity-btn flex-sm-nowrap">
                            <div class="wg-quantity">
                                <button type="button" class="btn-quantity minus-btn">
                                    <i class="icon icon-minus"></i>
                                </button>
                                <input class="quantity-product" type="text" name="number" value="1">
                                <button type="button" class="btn-quantity plus-btn">
                                    <i class="icon icon-plus"></i>
                                </button>
                            </div>
                            <a href="#shoppingCart" data-bs-toggle="offcanvas"
                                class="tf-btn style-btn-fill-sec animate-btn animate-dark w-100 radius-8">
                                <span class="fw-semibold text-caption-01">Add To Cart</span>
                            </a>
                        </div>
                    </div>
                    <a href="{{ $productUrl }}" class="tf-btn-line">
                        View Full Details
                    </a>
                </div>
            </div>
        </div>
    </div>
@endif
