@extends('frontend::layouts.app')

@section('title', 'Checkout - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        @include('frontend::components.checkout-page-title')
        @include('frontend::components.checkout-content')
        @include('frontend::components.footer')
    </main>
@endsection
