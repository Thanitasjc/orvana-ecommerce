<div class="modal modalCentered fade modal-quick-add" id="quickAdd">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="title-pop text-primary">Quick Add</h5>
                    <span class="icon-close-popup" data-bs-dismiss="modal">
                        <i class="icon icon-close"></i>
                    </span>
                </div>
                <div class="tf-product-info-wrap mt-0">
                    <div class="tf-product-info-inner tf-product-info-list mb-0">
                        <div class="tf-product-mini-view">
                            <a href="product-default.html" class="prd-image">
                                <img width="120" height="120" src="{{ asset('assets/images/product/product-10.jpg') }}"
                                    alt="Image Product">
                            </a>
                            <div class="prd-content">
                                <div class="price-wrap">
                                    <span class="price-new price-on-sale fw-medium lh-28 text-primary">$7.99</span>
                                </div>
                                <a href="product-default.html"
                                    class="prd-name lh-28 fw-medium text-primary link-underline">
                                    Finest Blackberries Mures - 170g/340g/680g
                                </a>
                            </div>
                        </div>
                        <div class="tf-product-info-variant">
                            <div class="variant-picker-item variant-unit">
                                <div class="variant-picker-label">
                                    <div class="text-body-large text-primary">
                                        Unit:
                                        <span
                                            class="variant-picker-label-value value-currentUnit fw-medium">1000gr</span>
                                    </div>
                                </div>
                                <div class="variant-picker-values">
                                    <span class="unit-btn" data-unit="250gr" data-price="4.99">250G</span>
                                    <span class="unit-btn" data-unit="500gr" data-price="9.99">500G</span>
                                    <span class="unit-btn active" data-unit="1000gr" data-price="14.99">1KG</span>
                                </div>
                            </div>
                        </div>
                        <div class="tf-product-total-quantity mb-0">
                            <div class="variant-picker-label">
                                <div class="text-body-large text-primary">
                                    Quantity:
                                </div>
                            </div>
                            <div class="variant-quantity">
                                <div class="wg-quantity style-2">
                                    <button class="btn-quantity btn-decrease">
                                        <i class="icon icon-minus"></i>
                                    </button>
                                    <input class="quantity-product" type="text" name="number" value="1">
                                    <button class="btn-quantity btn-increase">
                                        <i class="icon icon-plus"></i>
                                    </button>
                                </div>
                                <a href="#shoppingCart" data-bs-toggle="offcanvas"
                                    class="action-price tf-btn style-btn-fill-sec animate-btn animate-dark w-100">
                                    Add To Cart
                                    <i class="icon-minus d-none d-sm-block"></i>
                                    <span class="price-add d-none d-sm-block">$79.99</span>
                                </a>
                            </div>
                            <a href="{{ route('frontend.shopping-cart') }}" class="tf-btn style-btn-fill-pri animate-btn w-100">
                                <span class="fw-semibold">Buy It Now </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
