@php
    $miniCart = app(\App\Services\Ecommerce\CartService::class)->getOrCreate(request());
    $miniCartSubtotal = app(\App\Services\Ecommerce\CartService::class)->subtotal($miniCart);
    $freeShipTarget = 1000.0;
    $remainingToFreeShip = max(0, $freeShipTarget - $miniCartSubtotal);
    $progress = $freeShipTarget > 0 ? min(100, (int) round(($miniCartSubtotal / $freeShipTarget) * 100)) : 100;
@endphp

<div class="offcanvas offcanvas-end canvas-shop-cart" id="shoppingCart">
    <div class="canvas-wrapper">
        <div class="canvas-header">
            <h5 class="title-pop text-primary">Shopping Cart</h5>
            <span class="icon-close-popup" data-bs-dismiss="offcanvas">
                <i class="icon icon-close"></i>
            </span>
        </div>
        <div class="wrap">
            <div class="tf-mini-cart-threshold">
                <p class="text text-primary">
                    @if ($remainingToFreeShip > 0)
                        Buy
                        <span class="fw-medium">฿{{ number_format($remainingToFreeShip, 2) }}</span>
                        more to get
                        <span class="fw-medium">freeship</span>
                    @else
                        <span class="fw-medium">You qualified for free shipping!</span>
                    @endif
                </p>
                <div class="tf-progress-bar tf-progress-ship">
                    <div class="value" style="width: {{ $progress }}%;" data-progress="{{ $progress }}">
                        <i class="icon icon-Truck"></i>
                    </div>
                </div>
            </div>
            <div class="tf-mini-cart-wrap">
                <div class="tf-mini-cart-sroll">
                    <ul class="tf-mini-cart-items list-mini-product">
                        @forelse ($miniCart->items as $item)
                            <li class="mini-product-cart">
                                <div class="prd-wrap">
                                    <div class="prd_image">
                                        <img loading="lazy" width="100" height="100"
                                            src="{{ $item->product->mediaUrl(fallback: asset('assets/images/product/product-15.jpg')) }}"
                                            alt="{{ $item->product->getTranslation('name', config('locales.default', 'th')) }}">
                                    </div>
                                    <a href="{{ route('frontend.product.show', $item->product->slug) }}"
                                        class="prd_name link-underline text-primary fw-medium">
                                        {{ $item->product->getTranslation('name', config('locales.default', 'th')) }}
                                    </a>
                                </div>
                                <div class="prd-action">
                                    <form method="POST" action="{{ route('frontend.cart.items.destroy', $item) }}">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="tf-btn-line style-min p-0 border-0 bg-transparent">
                                            <span class="text-caption-01">Remove</span>
                                        </button>
                                    </form>
                                    <div class="quantity-price text-primary fw-medium">
                                        <span>{{ $item->quantity }}</span>
                                        <span>x</span>
                                        <span class="tf-mini-card-price">฿{{ number_format((float) $item->unit_price, 2) }}</span>
                                    </div>
                                </div>
                            </li>
                        @empty
                            <li class="mini-product-cart">
                                <p class="text-primary mb-0">Your cart is empty.</p>
                            </li>
                        @endforelse
                    </ul>
                </div>
            </div>
        </div>
        <div class="canvas-footer">
            <div class="tf-cart-totals-discounts fw-medium text-primary">
                <h4 class="tf-cart-total-text">Subtotal</h4>
                <h4 class="tf-totals-total-value">฿{{ number_format($miniCartSubtotal, 2) }}</h4>
            </div>
            <div class="checkbox-wrap">
                <input id="total" type="checkbox" class="tf-check style-4 radius-3">
                <label for="total" class="text-primary">
                    I agree with
                    <a href="#" class="text-decoration-underline fw-medium text-primary link-2">
                        Terms & Conditions
                    </a>
                </label>
            </div>
            <div class="group-btn">
                <a href="{{ route('frontend.shopping-cart') }}" class="tf-btn animate-btn w-100">
                    View Cart
                </a>
                <a href="{{ route('frontend.checkout') }}"
                    class="tf-btn style-stroke w-100 {{ $miniCart->items->isEmpty() ? 'disabled' : '' }}">
                    Check Out
                </a>
            </div>
            <div class="text-center">
                <a href="{{ route('frontend.shop.left-sidebar') }}" class="fw-semibold text-primary link-2 text-decoration-underline">
                    Or continue shopping
                </a>
            </div>
        </div>
    </div>
</div>
