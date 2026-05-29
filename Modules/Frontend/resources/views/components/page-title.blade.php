<section class="s-page-title">
    <div class="img-item-bg">
        <img loading="lazy" width="1920" height="420" src="{{ asset('assets/images/item/bg-title.png') }}" alt="Bg">
    </div>
    <div class="container">
        <ul class="breadcrums">
            <li><a href="{{ route('frontend.home') }}" class="text-caption-01 link text-white">Homepage</a></li>
            <li><i class="icon icon-arrow-right"></i></li>
            <li><a href="{{ route('frontend.shop.left-sidebar') }}" class="text-caption-01 link text-white">All Products</a></li>
            <li><i class="icon icon-arrow-right"></i></li>
            <li>
                <p class="text-caption-01 text-white-50">
                    @isset($product)
                        {{ $product->getTranslation('name', $locale ?? config('locales.default', 'th')) }}
                    @else
                        Products Details
                    @endisset
                </p>
            </li>
        </ul>
        <h1 class="page-title text-white font-sora">
            @isset($product)
                {{ $product->getTranslation('name', $locale ?? config('locales.default', 'th')) }}
            @else
                Products Details
            @endisset
        </h1>
    </div>
</section>
