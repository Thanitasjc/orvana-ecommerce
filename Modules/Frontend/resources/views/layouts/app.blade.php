<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-US" lang="en-US">
<head>
    <meta charset="utf-8">
    <title>@yield('title', 'Orvana - Organic & Food Store')</title>
    <meta name="author" content="themesflat.com">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="description"
        content="Orvana is a responsive HTML template for organic shops and eco-friendly stores, featuring 4 homepage layouts, modern design, smooth navigation, and essential eCommerce features for a professional online storefront.">

    <link rel="stylesheet" href="{{ asset('assets/fonts/fonts.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/icon/icomoon/style.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/swiper-bundle.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/animate.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('assets/css/styles.css') }}">

    <link rel="shortcut icon" href="{{ asset('assets/images/logo/favicon.svg') }}">
    <link rel="apple-touch-icon-precomposed" href="{{ asset('assets/images/logo/favicon.svg') }}">

    @stack('styles')
</head>
<body>
    @include('frontend::components.scroll-top')
    @include('frontend::components.preload')

    @if (session('success'))
        <div class="alert alert-success m-3" role="alert">{{ session('success') }}</div>
    @endif
    @if ($errors->any())
        <div class="alert alert-danger m-3" role="alert">
            <ul class="mb-0">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @yield('content')

    @include('frontend::partials.mobile-menu')
    @include('frontend::partials.forgot-password')
    @include('frontend::partials.quick-add')
    @include('frontend::partials.shopping-cart')
    @include('frontend::partials.quick-view')
    @include('frontend::partials.wishlist')
    @include('frontend::partials.register')
    @include('frontend::partials.login')
    @include('frontend::partials.search')

    <script src="{{ asset('assets/js/bootstrap.min.js') }}"></script>
    <script src="{{ asset('assets/js/jquery.min.js') }}"></script>
    <script src="{{ asset('assets/js/swiper-bundle.min.js') }}"></script>
    <script src="{{ asset('assets/js/carousel.js') }}"></script>
    <script src="{{ asset('assets/js/bootstrap-select.min.js') }}"></script>
    <script src="{{ asset('assets/js/wow.min.js') }}"></script>
    <script src="{{ asset('assets/js/parallaxie.js') }}"></script>
    <script src="{{ asset('assets/js/main.js') }}"></script>

    @stack('scripts')
</body>
</html>
