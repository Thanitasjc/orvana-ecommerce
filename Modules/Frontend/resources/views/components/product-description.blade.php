@php
    $locale = $locale ?? config('locales.default', 'th');
    $descriptionHtml = isset($product) ? $product->getTranslation('description', $locale) : null;
@endphp

<section class="section-product-desc flat-animate-tab flat-spacing-3 pb-0">
    <div class="container">
        <ul class="tab-btn-wrap-1 justify-content-md-center" role="tablist">
            <li class="nav-tab-item" role="presentation">
                <a href="#description" data-bs-toggle="tab" class="tf-btn-tab active" role="tab">
                    <span class="h5 fw-medium text-primary">Description</span>
                </a>
            </li>
        </ul>
    </div>
    <div class="tab-content overflow-hidden">
        <div class="tab-pane active show" id="description" role="tabpanel">
            <div class="tab-content_desc">
                <div class="container">
                    @if ($descriptionHtml)
                        <div class="product-cms-description text-primary">
                            {!! $descriptionHtml !!}
                        </div>
                    @else
                        <p class="text-primary">ยังไม่มีรายละเอียดสินค้า — เพิ่มได้ที่ Admin → สินค้า → แท็บ รายละเอียด</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</section>
