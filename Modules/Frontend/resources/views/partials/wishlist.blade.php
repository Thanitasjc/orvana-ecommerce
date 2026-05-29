<div class="offcanvas offcanvas-end canvas-wishlist" id="wishList">
        <div class="canvas-header">
            <h5 class="title-pop text-primary">Wish List</h5>
            <span class="icon-close-popup" data-bs-dismiss="offcanvas">
                <i class="icon icon-close"></i>
            </span>
        </div>
        <div class="canvas-body">
            <ul class="list-mini-product">
                <li class="mini-product-cart file-delete">
                    <div class="prd-wrap">
                        <div class="prd_image">
                            <img loading="lazy" width="100" height="100" src="{{ asset('assets/images/product/product-12.jpg') }}"
                                alt="Image">
                        </div>
                        <a href="{{ route('frontend.product.single1') }}" class="prd_name link-underline text-primary fw-medium">
                            Smackn’ Grapes Tomates - 1KG
                        </a>
                    </div>
                    <div class="prd-action">
                        <a href="#" class="tf-btn-line style-min p-0 remove">
                            <span class="text-caption-01">
                                Remove
                            </span>
                        </a>
                        <div class="quantity-price text-primary fw-medium">
                            <span>1</span>
                            <span>x</span>
                            <span>$3.99</span>
                        </div>
                    </div>
                </li>
                <li class="mini-product-cart file-delete">
                    <div class="prd-wrap">
                        <div class="prd_image">
                            <img loading="lazy" width="100" height="100" src="{{ asset('assets/images/product/product-11.jpg') }}"
                                alt="Image">
                        </div>
                        <a href="{{ route('frontend.product.single1') }}" class="prd_name link-underline text-primary fw-medium">
                            Range Large Brown Eggs, 18 Count
                        </a>
                    </div>
                    <div class="prd-action">
                        <a href="#" class="tf-btn-line style-min p-0 remove">
                            <span class="text-caption-01">
                                Remove
                            </span>
                        </a>
                        <div class="quantity-price text-primary fw-medium">
                            <span>1</span>
                            <span>x</span>
                            <span>$3.99</span>
                        </div>
                    </div>
                </li>
                <li class="mini-product-cart file-delete">
                    <div class="prd-wrap">
                        <div class="prd_image">
                            <img loading="lazy" width="100" height="100" src="{{ asset('assets/images/product/product-17.jpg') }}"
                                alt="Image">
                        </div>
                        <a href="{{ route('frontend.product.single1') }}" class="prd_name link-underline text-primary fw-medium">
                            Earthbound Farm Organic Baby Spinach - 250GR
                        </a>
                    </div>
                    <div class="prd-action">
                        <a href="#" class="tf-btn-line style-min p-0 remove">
                            <span class="text-caption-01">
                                Remove
                            </span>
                        </a>
                        <div class="quantity-price text-primary fw-medium">
                            <span>1</span>
                            <span>x</span>
                            <span>$3.99</span>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div class="canvas-footer">
            <div class="d-flex flex-column align-items-center gap-16 text-center">
                <a href="wishlist.html" class="tf-btn animate-btn w-100">
                    View All Wish List
                </a>
                <a href="{{ route('frontend.home') }}" class="tf-btn-line p-0">
                    Or continue shopping
                </a>
            </div>
        </div>
    </div>
