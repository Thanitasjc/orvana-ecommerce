@php
    $locale = $locale ?? config('locales.default', 'th');
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
                    alt="{{ $product->getTranslation('name', $locale) }}">
            </a>
            @if ($hasDiscount && $discountPercent)
                <ul class="list-badge">
                    <li class="badge-sale text-caption-02">-{{ $discountPercent }}%</li>
                </ul>
            @elseif ($product->is_featured)
                <ul class="list-badge">
                    <li class="badge-sale text-caption-02">NEW</li>
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
                    <a href="{{ route('frontend.product.show', $product->slug) }}"
                        class="hover-tooltip tooltip-left box-icon">
                        <span class="icon icon-eye"></span>
                        <span class="tooltip">View product</span>
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
                    {{ $product->getTranslation('name', $locale) }}
                </a>
                @if ($product->category)
                    <p class="product-cate text-caption-02 fw-medium">
                        {{ strtoupper($product->category->getTranslation('name', $locale)) }}
                    </p>
                @endif
            </div>
            <form method="POST" action="{{ route('frontend.cart.items.add') }}">
                @csrf
                <input type="hidden" name="product_id" value="{{ $product->id }}">
                <input type="hidden" name="quantity" value="1">
                <button type="submit" class="btn-add-to-card d-block text-decoration-none border-0 w-100">
                    <span class="text text-1 text-caption-01">Add To Cart</span>
                    <span class="text text-2 text-caption-01">View Product</span>
                </button>
            </form>
        </div>
    </div>
</div>
