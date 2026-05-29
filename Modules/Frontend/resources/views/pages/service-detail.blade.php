@extends('frontend::layouts.app')

@section('title', 'Service Detail - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        @include('frontend::components.service-detail-page-title')
        @include('frontend::components.service-detail')
        @include('frontend::components.footer')
    </main>
@endsection

