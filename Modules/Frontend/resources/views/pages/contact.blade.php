@extends('frontend::layouts.app')

@section('title', 'Contact Us - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        @include('frontend::components.contact-page-title')
        @include('frontend::components.contact-content')
        @include('frontend::components.footer')
    </main>
@endsection

