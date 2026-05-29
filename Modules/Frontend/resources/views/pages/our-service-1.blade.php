@extends('frontend::layouts.app')

@section('title', 'Our Services - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        @include('frontend::components.service-page-title')
        @include('frontend::components.service-benefit')
        @include('frontend::components.service-list')
        @include('frontend::components.service-organic')
        @include('frontend::components.footer')
    </main>
@endsection

