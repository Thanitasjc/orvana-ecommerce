@php
    $cart = $cart ?? app(\App\Services\Ecommerce\CartService::class)->getOrCreate(request());
    $subtotal = app(\App\Services\Ecommerce\CartService::class)->subtotal($cart);
@endphp

<section class="s-shoping-cart flat-spacing each-list-prd">
    <div class="container">
        <div class="row">
            <div class="col-lg-8">
                <div class="overflow-auto">
                    <table class="tf-table-page-cart">
                        <thead>
                            <tr>
                                <th class="h6">Products</th>
                                <th class="h6">Price</th>
                                <th class="h6">Quantity</th>
                                <th class="h6">Total Price</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($cart->items as $item)
                                <tr class="tf-cart_item">
                                    <td class="cart_product">
                                        <a href="{{ route('frontend.product.show', $item->product->slug) }}" class="img-prd">
                                            <img loading="lazy" width="100" height="100"
                                                src="{{ $item->product->mediaUrl(fallback: asset('assets/images/product/product-15.jpg')) }}"
                                                alt="{{ $item->product->getTranslation('name', config('locales.default', 'th')) }}">
                                        </a>
                                        <a href="{{ route('frontend.product.show', $item->product->slug) }}"
                                            class="name-prd lh-28 fw-medium text-primary link-underline">
                                            {{ $item->product->getTranslation('name', config('locales.default', 'th')) }}
                                        </a>
                                    </td>
                                    <td class="cart_price fw-medium text-primary">
                                        ฿{{ number_format((float) $item->unit_price, 2) }}
                                    </td>
                                    <td class="cart_quantity">
                                        <form method="POST" action="{{ route('frontend.cart.items.update', $item) }}"
                                            class="d-flex gap-2 align-items-center">
                                            @csrf
                                            @method('PATCH')
                                            <input class="quantity-product" type="number" min="0" name="quantity"
                                                value="{{ $item->quantity }}" style="width: 72px;">
                                            <button class="tf-btn style-2 py-2 px-3" type="submit">Update</button>
                                        </form>
                                    </td>
                                    <td>
                                        <div class="cart_total fw-medium text-primary">
                                            ฿{{ number_format((float) $item->line_total, 2) }}
                                        </div>
                                    </td>
                                    <td class="cart_remove">
                                        <form method="POST" action="{{ route('frontend.cart.items.destroy', $item) }}">
                                            @csrf
                                            @method('DELETE')
                                            <button class="icon border-0 bg-transparent" type="submit">
                                                <i class="icon-close"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center p-4 text-primary">Your cart is empty.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="fl-sidebar-cart mt-lg-0 sticky-top">
                    <div class="box-order-summary">
                        <h5 class="title text-primary">Order Summary</h5>
                        <div class="subtotal text-primary d-flex justify-content-between align-items-center">
                            <p class="fw-medium">Subtotal</p>
                            <span class="total fw-medium">฿{{ number_format($subtotal, 2) }}</span>
                        </div>
                        <div class="discount text-primary d-flex justify-content-between align-items-center">
                            <p class="fw-medium">Discounts</p>
                            <span class="total fw-medium">฿0.00</span>
                        </div>
                        <h5 class="total-order text-primary d-flex justify-content-between align-items-center">
                            <span>Total</span>
                            <span class="total">฿{{ number_format($subtotal, 2) }}</span>
                        </h5>
                        <div class="list-ver text-center">
                            <a href="{{ route('frontend.checkout') }}"
                                class="action-checkout tf-btn w-100 animate-btn bg-cl-text {{ $cart->items->isEmpty() ? 'disabled' : '' }}">
                                <span class="fw-semibold">Process To Checkout</span>
                            </a>
                            <a href="{{ route('frontend.shop.left-sidebar') }}" class="link-underline">
                                <span class="fw-semibold text-primary">Or Continue Shopping</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
