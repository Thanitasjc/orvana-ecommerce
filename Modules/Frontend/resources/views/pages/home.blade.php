@extends('frontend::layouts.app')

@section('title', 'Orvana - Organic & Food Store')

@section('content')
    <main id="wrapper">
        @include('frontend::components.header')
        @include('frontend::components.slideshow')
        @include('frontend::components.category')
        @include('frontend::components.product')
        @include('frontend::components.lookbook')
        @include('frontend::components.banner-shop-detail')
        @include('frontend::components.related-product')
        @include('frontend::components.testimonial')
        @include('frontend::components.home-services')
        @include('frontend::components.banner-image-text')
        @include('frontend::components.box-icon')
        @include('frontend::components.footer')
    </main>
@endsection
