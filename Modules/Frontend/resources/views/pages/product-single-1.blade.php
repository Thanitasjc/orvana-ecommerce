@extends('frontend::layouts.app')

@section('title', isset($product) ? $product->getTranslation('name', $locale ?? 'th') . ' - Orvana' : 'Product Single - Orvana')

@push('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/drift-basic.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/photoswipe.css') }}">
@endpush

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        @include('frontend::components.page-title')
        @include('frontend::components.product-single')
        @include('frontend::components.product-description')
        @include('frontend::components.related-products-dynamic')
        @include('frontend::components.footer')
    </main>
@endsection

@push('scripts')
    <script src="{{ asset('assets/js/zoom.js') }}"></script>
    <script src="{{ asset('assets/js/nouislider.min.js') }}"></script>
    <script src="{{ asset('assets/js/drift.min.js') }}"></script>
    <script src="{{ asset('assets/js/photoswipe-lightbox.umd.min.js') }}"></script>
    <script src="{{ asset('assets/js/photoswipe.umd.min.js') }}"></script>
@endpush
