@php
    $headerCart = app(\App\Services\Ecommerce\CartService::class)->getOrCreate(request());
    $headerCartCount = app(\App\Services\Ecommerce\CartService::class)->totalItems($headerCart);
@endphp

<header class="tf-header header-3">
            <div class="header-top">
                <div class="container">
                    <div class="header-top_wrap">
                        <div class="box-btn-menu d-xl-none">
                            <a href="#mobileMenu" data-bs-toggle="offcanvas" class="btn-mobile-menu style-white">
                                <span></span>
                            </a>
                        </div>
                        <a href="{{ route('frontend.home') }}" class="inner-left logo-site">
                            <img loading="lazy" width="207" height="48" src="{{ asset('assets/images/logo/logo-white.svg') }}"
                                alt="Image">
                        </a>
                        <div class="inner-midle">
                            <form class="form_search-product d-none d-xl-flex">
                                <div class="select-category">
                                    <select name="product_cat" id="product_cat" class="dropdown_product_cat">
                                        <option value="" selected="selected">All categories</option>
                                        <option class="level-0" value="apple-products">Vegetables</option>
                                        <option class="level-0" value="audio-equipments">Fruits</option>
                                        <option class="level-0" value="camera-video">Grains & Rice</option>
                                        <option class="level-0" value="game-room-furniture">Nuts & Seeds</option>
                                        <option class="level-0" value="gaming-accessories">Herbs & Spices</option>
                                        <option class="level-0" value="headphone">Tea & Coffee</option>
                                        <option class="level-0" value="laptop-tablet">Dairy Products</option>
                                        <option class="level-0" value="server-workstation">Meat & Poultry</option>
                                        <option class="level-0" value="smartphone">Seafood</option>
                                        <option class="level-0" value="smartwatch">Supplements</option>
                                        <option class="level-0" value="storage-digital-devices">Baby Food</option>
                                    </select>
                                    <ul class="select-options">
                                        <li class="link" rel=""><span>All categories</span></li>
                                        <li class="link" rel="apple-products"><span>Vegetables</span> </li>
                                        <li class="link" rel="audio-equipments"><span>Fruits</span></li>
                                        <li class="link" rel="camera-video"><span>Grains & Rice</span></li>
                                        <li class="link" rel="game-room-furniture"><span>Nuts & Seeds</span></li>
                                        <li class="link" rel="gaming-accessories"><span>Herbs & Spices</span></li>
                                        <li class="link" rel="headphone"><span>Tea & Coffee</span></li>
                                        <li class="link" rel="laptop-tablet"><span>Dairy Products</span></li>
                                        <li class="link" rel="server-workstation"><span>Meat & Poultry</span></li>
                                        <li class="link" rel="smartphone"><span>Seafood</span></li>
                                        <li class="link" rel="smartwatch"><span>Supplements</span></li>
                                        <li class="link" rel="storage-digital-devices"><span>Baby Food</span></li>
                                    </ul>
                                </div>
                                <div class="br-line"></div>
                                <input class="entry-ip" type="text" placeholder="Search for products..." required>
                                <button type="submit" class="btn-submit">
                                    <span class="fw-semibold text-primary">Search</span>
                                </button>
                            </form>
                        </div>
                        <div class="inner-right">
                            <ul class=" nav-icon-list justify-content-end">
                                <li>
                                    @auth
                                        <a href="{{ route('frontend.account.profile') }}" class="nav-icon-item text-white link">
                                            <i class="icon icon-user"></i>
                                            <span class="text text-main fw-semibold">MY ACCOUNT</span>
                                        </a>
                                    @else
                                        <a href="#login" data-bs-toggle="modal" data-bs-target="#login" class="nav-icon-item text-white link">
                                            <i class="icon icon-user"></i>
                                            <span class="text text-main fw-semibold">ACCOUNT</span>
                                        </a>
                                    @endauth
                                </li>
                                @auth
                                    <li class="d-none d-sm-block">
                                        <a href="{{ route('frontend.account.orders') }}" class="nav-icon-item text-white link">
                                            <i class="icon icon-user"></i>
                                            <span class="text text-main fw-semibold">MY ORDERS</span>
                                        </a>
                                    </li>
                                    <li class="d-none d-sm-block">
                                        <form method="POST" action="{{ route('frontend.auth.logout') }}" class="d-inline">
                                            @csrf
                                            <button type="submit" class="nav-icon-item text-white link border-0 bg-transparent">
                                                <i class="icon icon-close"></i>
                                                <span class="text text-main fw-semibold">LOGOUT</span>
                                            </button>
                                        </form>
                                    </li>
                                @endauth
                                <li class="d-none d-sm-block">
                                    <a href="#wishList" data-bs-toggle="offcanvas"
                                        class="nav-icon-item text-white link">
                                        <i class="icon icon-heart-stroke"></i>
                                        <span class="text text-main fw-semibold">
                                            WISHLIST
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#shoppingCart" data-bs-toggle="offcanvas"
                                        class="nav-icon-item text-white link has-num">
                                        <i class="icon icon-ShoppingCartSimple"></i>
                                        <span class="number-count text-caption-02">{{ $headerCartCount }}</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="header-inner">
                <div class="container">
                    <div class="header-inner_wrap">
                        <div class="col-left">
                            <div class="nav-category-wrap main-action-active">
                                <div class="btn-nav-drop btn-active">
                                    <p class="name-category fw-semibold">Shop By Categories</p>
                                    <i class="icon icon-caret-down"></i>
                                </div>
                                <ul class="box-nav-category active-item">
                                    <li>
                                        <a href="#" class="nav-category_link text-primary link-secondary">
                                            Fresh Vegetables
                                            <i class="icon icon-caret-right"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" class="nav-category_link text-primary link-secondary">
                                            Seasonal Fruits
                                            <i class="icon icon-caret-right"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" class="nav-category_link text-primary link-secondary">
                                            Farm Fresh Eggs
                                            <i class="icon icon-caret-right"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" class="nav-category_link text-primary link-secondary">
                                            Natural Farm Dairy
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" class="nav-category_link text-primary link-secondary">
                                            Organic Grains
                                            <i class="icon icon-caret-right"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" class="nav-category_link text-primary link-secondary">
                                            Pressed Juices
                                        </a>
                                    </li>
                                    <li class="br-line px-0 d-flex"></li>
                                    <li>
                                        <a href="#" class="nav-category_link text-primary link-secondary">
                                            Hot Offers
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" class="nav-category_link text-primary link-secondary">
                                            Value of the Day
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" class="nav-category_link text-primary link-secondary">
                                            Top 100 Offers
                                        </a>
                                    </li>
                                </ul>
                            </div>
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
                                                <li><a href="shop-right-sidebar.html" class="sub-menu_link">Shop Right
                                                        Sidebar</a></li>
                                                <li><a href="shop-filter-sidebar.html" class="sub-menu_link">Shop Filter
                                                        Canvas</a></li>
                                                <li><a href="{{ route('frontend.shopping-cart') }}" class="sub-menu_link">Shopping Cart</a>
                                                </li>
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
                                                <li><a href="{{ route('frontend.product.single1') }}" class="sub-menu_link">Product Single
                                                        1</a>
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
                                                <li><a href="blog-standard.html" class="sub-menu_link">Blog Standard</a>
                                                </li>
                                                <li><a href="{{ route('frontend.blog.grid') }}" class="sub-menu_link">Blog Grid</a></li>
                                                
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
                                                <li><a href="{{ route('frontend.about') }}" class="sub-menu_link">About Us</a></li>
                                                </li>
                                                <li><a href="{{ route('frontend.contact') }}" class="sub-menu_link">Contact Us</a></li>
                                                <li class="has-menu_lv2">
                                                    <a href="#" class="sub-menu_link">
                                                        <span class="text">
                                                            Our Services
                                                        </span>
                                                        <i class="icon icon-caret-right"></i>
                                                    </a>
                                                    <ul class="sub-menu-lv2">
                                                        <li><a href="{{ route('frontend.services.index') }}" class="sub-menu_link">Our
                                                                Services 1</a></li>
                                                    </ul>
                                                </li>

                                                <li><a href="faq.html" class="sub-menu_link">FAQs</a></li>
                                                <li><a href="privacy-policy.html" class="sub-menu_link">Privacy
                                                        Policy</a></li>
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
                        <a href="#" class="col-right fw-medium text-primary">
                            <i class="icon-SealPercent fs-24"></i>
                            Special Offers!
                        </a>
                    </div>
                </div>
            </div>
        </header>
