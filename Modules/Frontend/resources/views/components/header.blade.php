@php
    $headerCart = app(\App\Services\Ecommerce\CartService::class)->getOrCreate(request());
    $headerCartCount = app(\App\Services\Ecommerce\CartService::class)->totalItems($headerCart);
@endphp

<header class="tf-header header-abs">
            <div class="header-inner">
                <div class="box-btn-menu d-xl-none">
                    <a href="#mobileMenu" data-bs-toggle="offcanvas" class="btn-mobile-menu">
                        <span></span>
                    </a>
                </div>
                <div class="header-left">
                    <a href="{{ route('frontend.home') }}" class="logo-site">
                        <img loading="lazy" width="207" height="48" src="{{ asset('assets/images/logo/logo-default.svg') }}"
                            alt="Logo">
                    </a>
                    <nav class="box-navigation d-none d-xl-block">
                        <ul class="box-nav-menu">
                            <li class="menu-item">
                                <a href="#" class="item-link lh-28">
                                    <span class="text">
                                        Home
                                        <i class="icon icon-caret-down"></i>
                                    </span>
                                </a>
                                <div class="sub-menu">
                                    <ul class="sub-menu_list">
                                        <li><a href="{{ route('frontend.home') }}" class="sub-menu_link">Homepage 1</a></li>
                                    </ul>
                                </div>
                            </li>
                            <li class="menu-item">
                                <a href="#" class="item-link lh-28">
                                    <span class="text">
                                        Shop
                                        <i class="icon icon-caret-down"></i>
                                    </span>
                                </a>
                                <div class="sub-menu">
                                    <ul class="sub-menu_list">
                                        <li><a href="{{ route('frontend.shop.left-sidebar') }}" class="sub-menu_link">All Products</a>
                                        </li>
                                        <li><a href="{{ route('frontend.shopping-cart') }}" class="sub-menu_link">Shopping Cart</a></li>
                                        <li><a href="{{ route('frontend.checkout') }}" class="sub-menu_link">Check Out</a></li>

                                    </ul>
                                </div>
                            </li>
                            <li class="menu-item">
                                <a href="#" class="item-link lh-28">
                                    <span class="text">
                                        Products
                                        <i class="icon icon-caret-down"></i>
                                    </span>
                                </a>
                                <div class="sub-menu">
                                    <ul class="sub-menu_list">
                                        <li><a href="{{ route('frontend.product.single1') }}" class="sub-menu_link">Product Single 1</a>
                                        </li>
                                       
                                    </ul>
                                </div>
                            </li>
                            <li class="menu-item">
                                <a href="#" class="item-link lh-28">
                                    <span class="text">
                                        Blogs
                                        <i class="icon icon-caret-down"></i>
                                    </span>
                                </a>
                                <div class="sub-menu">
                                    <ul class="sub-menu_list">
                                        
                                        <li><a href="{{ route('frontend.blog.grid') }}" class="sub-menu_link">Blog Grid</a></li>
                                        
                                        <li><a href="{{ route('frontend.blog.post2') }}" class="sub-menu_link">Blog Post 2</a></li>
                                    </ul>
                                </div>
                            </li>
                            <li class="menu-item">
                                <a href="#" class="item-link lh-28">
                                    <span class="text">
                                        Pages
                                        <i class="icon icon-caret-down"></i>
                                    </span>
                                </a>
                                <div class="sub-menu">
                                    <ul class="sub-menu_list">
                                        <li><a href="about-us.html" class="sub-menu_link">About Us</a></li>
                                        <li><a href="contact.html" class="sub-menu_link">Contact Us</a></li>
                                        <li class="has-menu_lv2">
                                            <a href="#" class="sub-menu_link">
                                                <span class="text">
                                                    Our Services
                                                </span>
                                                <i class="icon icon-caret-right"></i>
                                            </a>
                                            <ul class="sub-menu-lv2">
                                                <li><a href="{{ route('frontend.services.index') }}" class="sub-menu_link">Our Services
                                                        1</a></li>
                                                <li>
                                            </ul>
                                        </li>
                                        <li class="has-menu_lv2">
                                            <a href="#" class="sub-menu_link">
                                                <span class="text">
                                                    Case Studies
                                                </span>
                                                <i class="icon icon-caret-right"></i>
                                            </a>
                                            <ul class="sub-menu-lv2">
                                                <li><a href="case-studies-1.html" class="sub-menu_link">Case Studies
                                                        1</a></li>
                                                <li><a href="case-studies-2.html" class="sub-menu_link">Case Studies
                                                        2</a></li>
                                                <li><a href="case-studies-3.html" class="sub-menu_link">Case Studies
                                                        3</a></li>
                                                <li><a href="case-detail.html" class="sub-menu_link">Case Details</a>
                                                </li>
                                            </ul>
                                        </li>
                                        <li><a href="faq.html" class="sub-menu_link">FAQs</a></li>
                                        <li><a href="privacy-policy.html" class="sub-menu_link">Privacy Policy</a></li>
                                        @auth
                                            <li><a href="{{ route('frontend.account.profile') }}" class="sub-menu_link">My Profile</a></li>
                                            <li><a href="{{ route('frontend.account.orders') }}" class="sub-menu_link">My Orders</a></li>
                                        @endauth
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div class="header-right">
                    <div class="box-nav-icon">
                        <a href="#canvasSearch" data-bs-toggle="offcanvas"
                            class="nav-icon-item text-primary link d-none d-md-flex">
                            <i class="icon icon-magnifying-glass"></i>
                        </a>
                        <div class="br-line d-none d-md-inline-flex"></div>
                        <ul class="nav-icon-list">
                            <li>
                                @auth
                                    <a href="{{ route('frontend.account.profile') }}" class="nav-icon-item text-primary link" title="My Profile">
                                        <i class="icon icon-user"></i>
                                    </a>
                                @else
                                    <a href="#login" data-bs-toggle="modal" data-bs-target="#login" class="nav-icon-item text-primary link">
                                        <i class="icon icon-user"></i>
                                    </a>
                                @endauth
                            </li>
                            @auth
                                <li class="d-none d-sm-block">
                                    <form method="POST" action="{{ route('frontend.auth.logout') }}" class="d-inline">
                                        @csrf
                                        <button type="submit" class="nav-icon-item text-primary link border-0 bg-transparent" title="Logout">
                                            <i class="icon icon-close"></i>
                                        </button>
                                    </form>
                                </li>
                            @endauth
                            <li class="d-none d-sm-block">
                                <a href="#wishList" data-bs-toggle="offcanvas" class="nav-icon-item text-primary link">
                                    <i class="icon icon-heart-stroke"></i>
                                </a>
                            </li>
                            <li>
                                <a href="#shoppingCart" data-bs-toggle="offcanvas"
                                    class="nav-icon-item text-primary link has-num">
                                    <i class="icon icon-ShoppingCartSimple"></i>
                                    <span class="number-count text-caption-02">{{ $headerCartCount }}</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div class="box-nav-support d-none d-xxl-flex">
                        <div class="ic-wrap">
                            <i class="icon icon-phone-call"></i>
                        </div>
                        <div class="info">
                            <p class="title text-caption-01">
                                Have any Question?
                            </p>
                            <a href="tel:3156666688" class="h6 fw-medium text-primary">
                                315-666-6688
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
