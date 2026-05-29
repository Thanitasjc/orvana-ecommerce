@php
    $cart = $cart ?? app(\App\Services\Ecommerce\CartService::class)->getOrCreate(request());
    $subtotal = app(\App\Services\Ecommerce\CartService::class)->subtotal($cart);
@endphp

<section class="s-check-out flat-spacing">
    <div class="container">
        <div class="row">
            <div class="col-lg-7 col-xl-6">
                <div class="tf-page-checkout mb-lg-0">
                    <form class="tf-checkout-cart-main" method="POST" action="{{ route('frontend.checkout.place-order') }}">
                        @csrf
                        <div class="box-ip-checkout estimate-shipping">
                            <h5 class="title text-primary">Information</h5>
                            <div class="form-content">
                                <div class="tf-grid-layout sm-col-2">
                                    <input type="text" name="first_name" placeholder="First Name*" required value="{{ old('first_name') }}">
                                    <input type="text" name="last_name" placeholder="Last Name*" required value="{{ old('last_name') }}">
                                </div>
                                <div class="tf-grid-layout sm-col-2">
                                    <input type="email" name="email" placeholder="Email Address*" required value="{{ old('email', auth()->user()?->email) }}">
                                    <input type="text" name="phone" placeholder="Phone Number*" required value="{{ old('phone') }}">
                                </div>
                                <div class="tf-grid-layout sm-col-2">
                                    <input type="text" name="country" placeholder="Country*" required value="{{ old('country', 'Thailand') }}">
                                    <input type="text" name="state" placeholder="State/Province" value="{{ old('state') }}">
                                </div>
                                <div class="tf-grid-layout sm-col-2">
                                    <input type="text" name="city" placeholder="City*" required value="{{ old('city') }}">
                                    <input type="text" name="postal_code" placeholder="Postal Code*" required value="{{ old('postal_code') }}">
                                </div>
                                <fieldset>
                                    <input type="text" name="address_line1" placeholder="Address Line 1*" required value="{{ old('address_line1') }}">
                                </fieldset>
                                <fieldset>
                                    <input type="text" name="address_line2" placeholder="Address Line 2" value="{{ old('address_line2') }}">
                                </fieldset>
                                <fieldset class="d-grid">
                                    <textarea name="note" placeholder="Write note...">{{ old('note') }}</textarea>
                                </fieldset>
                            </div>
                        </div>

                        <div class="box-ip-payment">
                            <h5 class="title text-primary">Shipping Method</h5>
                            <div class="payment-method-box">
                                <label class="payment_check checkbox-wrap">
                                    <input type="radio" name="shipping_method" value="standard" class="tf-check-rounded style-2"
                                        {{ old('shipping_method', 'standard') === 'standard' ? 'checked' : '' }}>
                                    <span class="pay-title fw-medium">Standard (฿50, free over ฿1,000)</span>
                                </label>
                                <label class="payment_check checkbox-wrap">
                                    <input type="radio" name="shipping_method" value="express" class="tf-check-rounded style-2"
                                        {{ old('shipping_method') === 'express' ? 'checked' : '' }}>
                                    <span class="pay-title fw-medium">Express (฿80, free over ฿1,500)</span>
                                </label>
                            </div>
                        </div>

                        <div class="box-ip-payment">
                            <h5 class="title text-primary">Payment Option</h5>
                            <div class="payment-method-box">
                                <label class="payment_check checkbox-wrap">
                                    <input type="radio" name="payment_method" value="bank_transfer" class="tf-check-rounded style-2"
                                        {{ old('payment_method', 'bank_transfer') === 'bank_transfer' ? 'checked' : '' }}>
                                    <span class="pay-title fw-medium">Bank Transfer (mark paid now)</span>
                                </label>
                                <label class="payment_check checkbox-wrap">
                                    <input type="radio" name="payment_method" value="cod" class="tf-check-rounded style-2"
                                        {{ old('payment_method') === 'cod' ? 'checked' : '' }}>
                                    <span class="pay-title fw-medium">Cash On Delivery</span>
                                </label>
                            </div>
                        </div>
                        <button type="submit" class="tf-btn animate-btn">Place Order</button>
                    </form>
                </div>
            </div>
            <div class="col-xl-1 d-none d-xl-block">
                <div class="br-line line-center"></div>
            </div>
            <div class="col-lg-5">
                <div class="fl-sidebar-cart mt-lg-0 sticky-top">
                    <div class="box-your-order">
                        <h5 class="title text-primary">Shopping Cart</h5>
                        <ul class="list-order-product">
                            @foreach ($cart->items as $item)
                                <li class="order-item fw-medium">
                                    <a href="{{ route('frontend.product.show', $item->product->slug) }}" class="img-prd">
                                        <img loading="lazy" width="100" height="100"
                                            src="{{ $item->product->mediaUrl(fallback: asset('assets/images/product/product-15.jpg')) }}"
                                            alt="{{ $item->product->getTranslation('name', config('locales.default', 'th')) }}">
                                    </a>
                                    <a href="{{ route('frontend.product.show', $item->product->slug) }}" class="infor-prd text-primary link-underline">
                                        {{ $item->product->getTranslation('name', config('locales.default', 'th')) }}
                                    </a>
                                    <div class="quantity-price text-primary">
                                        <span>{{ $item->quantity }}</span>
                                        <span>x</span>
                                        <span>฿{{ number_format((float) $item->unit_price, 2) }}</span>
                                    </div>
                                </li>
                            @endforeach
                        </ul>
                        <ul class="list-total">
                            <li class="total-item fw-medium text-primary">
                                <span>Subtotal</span>
                                <span>฿{{ number_format($subtotal, 2) }}</span>
                            </li>
                        </ul>
                        <div class="last-total h5 fw-medium text-primary">
                            <span>Grand total (before shipping)</span>
                            <span>฿{{ number_format($subtotal, 2) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
