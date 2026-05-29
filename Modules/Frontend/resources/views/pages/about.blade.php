@extends('frontend::layouts.app')

@section('title', 'About Us - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        @include('frontend::components.about-page-title')
        @include('frontend::components.about-intro')
        @include('frontend::components.about-history')
        @include('frontend::components.about-break-image')
        @include('frontend::components.about-service')
        @include('frontend::components.about-team')
        @include('frontend::components.about-break-line')
        @include('frontend::components.about-testimonial')
        @include('frontend::components.about-partner-contact')
        @include('frontend::components.about-gallery')
        @include('frontend::components.footer')
    </main>
@endsection

