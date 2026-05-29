@extends('frontend::layouts.app')

@section('title', isset($post) ? $post->getTranslation('title', $locale ?? config('locales.default', 'th')) . ' - Orvana' : 'Blog Post - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        @include('frontend::components.blog-post-page-title')
        @include('frontend::components.blog-post-content')
        @include('frontend::components.blog-related')
        @include('frontend::components.footer')
    </main>
@endsection

@push('scripts')
    <script src="{{ asset('assets/js/carousel.js') }}"></script>
@endpush
