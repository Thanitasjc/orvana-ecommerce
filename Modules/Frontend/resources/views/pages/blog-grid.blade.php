@extends('frontend::layouts.app')

@section('title', 'Latest News - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        @include('frontend::components.blog-grid-page-title')
        @include('frontend::components.blog-grid')
        @include('frontend::components.footer')
    </main>
@endsection
