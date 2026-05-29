<footer class="tf-footer">
            <div class="footer-inner-wrap">
                <div class="container">
                    <div class="footer-inner">
                        <div class="inner-left">
                            <a href="{{ route('frontend.home') }}" class="logo-site">
                                <img loading="lazy" width="207" height="48" src="{{ asset('assets/images/logo/logo-white.svg') }}"
                                    alt="">
                            </a>
                            <p class="h5 fw-medium title text-white font-sora">
                                Subscribe For All The Top News!
                            </p>
                            <p class="sub-title text-caption-01 text-white">
                                Sign up for updates on our latest news and events.
                            </p>
                            <form class="form-subcribe">
                                <input class="style-2" name="email" type="email" placeholder="Enter your email address"
                                    required>
                                <button type="submit" class="btn-submit">
                                    <i class="icon icon-attached"></i>
                                </button>
                            </form>
                        </div>
                        <div class="inner-center">
                            <div class="footer-col-block">
                                <p class="footer-heading footer-heading-mobile text-caption-02">
                                    QUICK LINK
                                </p>
                                <div class="tf-collapse-content">
                                    <ul class="footer-menu-list">
                                        @forelse ($footerCategories ?? [] as $footerCategory)
                                            <li>
                                                <a href="{{ route('frontend.shop.left-sidebar', $footerCategory->slug) }}" class="link">
                                                    {{ $footerCategory->getTranslation('name', config('locales.default', 'th')) }}
                                                </a>
                                            </li>
                                        @empty
                                            <li><a href="{{ route('frontend.shop.left-sidebar') }}" class="link">All Products</a></li>
                                        @endforelse
                                    </ul>
                                </div>
                            </div>
                            <div class="footer-col-block">
                                <p class="footer-heading footer-heading-mobile text-caption-02">
                                    COMPANY
                                </p>
                                <div class="tf-collapse-content">
                                    <ul class="footer-menu-list">
                                        <li><a href="{{ route('frontend.about') }}" class="link">About us</a></li>
                                        <li><a href="privacy-policy.html" class="link">How to Order</a></li>
                                        <li><a href="{{ route('frontend.about') }}" class="link">Our Team</a></li>
                                        <li><a href="{{ route('frontend.services.index') }}" class="link">Services</a></li>
                                        <li><a href="{{ route('frontend.contact') }}" class="link">Contact Us</a></li>
                                        <li><a href="faq.html" class="link">FAQs</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="inner-right">
                            <div class="footer-col-block">
                                <p class="footer-heading footer-heading-mobile text-caption-02">
                                    CONTACT
                                </p>
                                <div class="tf-collapse-content">
                                    <div class="footer-info">
                                        <a href="#" class="link infor-address font-jakarta">101 E 129th St, Chicago, New
                                            York</a>
                                        <a href="#" class="link infor-phone font-jakarta">1-555-678-8888</a>
                                        <a href="#"
                                            class="link infor-email font-jakarta text-decoration-underline">themesflat@gmail.com</a>
                                        <ul class="social-list">
                                            <li><a href="#" class="link"><i class="icon icon-FacebookLogo"></i></a></li>
                                            <li><a href="#" class="link"><i class="icon icon-XLogo"></i></a></li>
                                            <li><a href="#" class="link"><i class="icon icon-TiktokLogo"></i></a></li>
                                            <li><a href="#" class="link"><i class="icon icon-InstagramLogo"></i></a>
                                            </li>
                                            <li><a href="#" class="link"><i class="icon icon-YoutubeLogo"></i></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="container position-relative">
                    <div class="br-line ver-abs top-0 bg-white_10"></div>
                    <p class="text-copy text-caption-01 fw-medium text-white">
                        ©2026 Orvana. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
