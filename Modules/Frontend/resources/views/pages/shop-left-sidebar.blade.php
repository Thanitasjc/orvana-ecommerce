@extends('frontend::layouts.app')

@section('title', ($activeCategory ?? null)
    ? $activeCategory->getTranslation('name', $locale ?? config('locales.default', 'th')) . ' - All Products'
    : 'All Products - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        @include('frontend::components.shop-page-title')
        @include('frontend::components.shop')
        @include('frontend::components.footer')
    </main>
@endsection
