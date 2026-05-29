@extends('frontend::layouts.app')

@section('title', 'Shopping Cart - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        @include('frontend::components.cart-page-title')
        @include('frontend::components.cart-content')
        @include('frontend::components.related-product')
        @include('frontend::components.footer')
    </main>
@endsection

@push('scripts')
    <script src="{{ asset('assets/js/count-down.js') }}"></script>
@endpush
