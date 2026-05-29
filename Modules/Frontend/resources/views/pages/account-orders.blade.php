@extends('frontend::layouts.app')

@section('title', 'My Orders - Orvana')

@section('content')
    @php
        $productFallback = asset('assets/images/product/product-15.jpg');
    @endphp
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        <section class="flat-spacing">
            <div class="container">
                <h3 class="text-primary mb-4">My Orders</h3>
                <div class="overflow-auto">
                    <table class="table align-middle">
                        <thead>
                            <tr>
                                <th>Items</th>
                                <th>Order</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($orders as $order)
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center gap-1 flex-wrap">
                                            @foreach ($order->items->take(3) as $item)
                                                @if ($item->product?->slug)
                                                    <a href="{{ route('frontend.product.show', $item->product->slug) }}"
                                                        class="account-order-thumb" title="{{ $item->product_name }}">
                                                        <img loading="lazy" width="48" height="48"
                                                            src="{{ $item->product->mediaUrl(fallback: $productFallback) }}"
                                                            alt="{{ $item->product_name }}">
                                                    </a>
                                                @else
                                                    <span class="account-order-thumb">
                                                        <img loading="lazy" width="48" height="48"
                                                            src="{{ $productFallback }}"
                                                            alt="{{ $item->product_name }}">
                                                    </span>
                                                @endif
                                            @endforeach
                                            @if ($order->items->count() > 3)
                                                <span class="text-caption-01 text-primary fw-medium">
                                                    +{{ $order->items->count() - 3 }}
                                                </span>
                                            @endif
                                        </div>
                                    </td>
                                    <td>{{ $order->order_number }}</td>
                                    <td>{{ strtoupper($order->status) }}</td>
                                    <td>฿{{ number_format((float) $order->total_amount, 2) }}</td>
                                    <td>{{ optional($order->placed_at)->format('d/m/Y H:i') }}</td>
                                    <td>
                                        <a href="{{ route('frontend.account.orders.show', $order) }}"
                                            class="link-underline text-primary">View</a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center">No orders yet.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                {{ $orders->links() }}
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
            width: 48px;
            height: 48px;
            object-fit: cover;
        }
    </style>
@endpush
