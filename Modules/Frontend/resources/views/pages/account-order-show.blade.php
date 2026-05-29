@extends('frontend::layouts.app')

@section('title', 'Order Details - Orvana')

@section('content')
    @php
        $productFallback = asset('assets/images/product/product-15.jpg');
    @endphp
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        <section class="flat-spacing">
            <div class="container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h3 class="text-primary mb-0">Order {{ $order->order_number }}</h3>
                    <a href="{{ route('frontend.account.orders') }}" class="link-underline text-primary">Back to orders</a>
                </div>

                <div class="mb-4">
                    <p class="mb-1"><strong>Status:</strong> {{ strtoupper($order->status) }}</p>
                    <p class="mb-1"><strong>Payment:</strong> {{ strtoupper(optional($order->payments->first())->status ?? 'pending') }}</p>
                    <p class="mb-1"><strong>Shipping:</strong> {{ ucfirst($order->shipping_method) }}</p>
                </div>

                <div class="overflow-auto">
                    <table class="table align-middle">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Unit</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($order->items as $item)
                                <tr>
                                    <td>
                                        @if ($item->product?->slug)
                                            <a href="{{ route('frontend.product.show', $item->product->slug) }}"
                                                class="account-order-thumb" title="{{ $item->product_name }}">
                                                <img loading="lazy" width="64" height="64"
                                                    src="{{ $item->product->mediaUrl(fallback: $productFallback) }}"
                                                    alt="{{ $item->product_name }}">
                                            </a>
                                        @else
                                            <span class="account-order-thumb">
                                                <img loading="lazy" width="64" height="64"
                                                    src="{{ $productFallback }}"
                                                    alt="{{ $item->product_name }}">
                                            </span>
                                        @endif
                                    </td>
                                    <td>{{ $item->product_name }}</td>
                                    <td>{{ $item->quantity }}</td>
                                    <td>฿{{ number_format((float) $item->unit_price, 2) }}</td>
                                    <td>฿{{ number_format((float) $item->line_total, 2) }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                <div class="mt-3">
                    <p class="mb-1"><strong>Subtotal:</strong> ฿{{ number_format((float) $order->subtotal_amount, 2) }}</p>
                    <p class="mb-1"><strong>Shipping:</strong> ฿{{ number_format((float) $order->shipping_amount, 2) }}</p>
                    <p class="mb-0"><strong>Total:</strong> ฿{{ number_format((float) $order->total_amount, 2) }}</p>
                </div>
            </div>
        </section>
        @include('frontend::components.footer')
    </main>
@endsection

@push('styles')
    <style>
        .account-order-thumb {
            display: inline-flex;
            flex-shrink: 0;
            overflow: hidden;
            border-radius: 6px;
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .account-order-thumb img {
            display: block;
            width: 64px;
            height: 64px;
            object-fit: cover;
        }
    </style>
@endpush
