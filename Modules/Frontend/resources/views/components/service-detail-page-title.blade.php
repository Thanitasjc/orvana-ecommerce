@php
    $locale = $locale ?? config('locales.default', 'th');
@endphp

<section class="s-page-title page-title-service">
    <div class="img-item-bg">
        <img loading="lazy" width="1920" height="420" src="{{ asset('assets/images/item/bg-title.png') }}" alt="Bg">
    </div>
    <div class="container">
        <ul class="breadcrums flex-wrap">
            <li><a href="{{ route('frontend.home') }}" class="text-caption-01 link text-white">Homepage</a></li>
            <li><i class="icon icon-arrow-right"></i></li>
            <li>
                <a href="{{ route('frontend.services.index') }}" class="text-caption-01 link text-white">Our Services</a>
            </li>
            <li><i class="icon icon-arrow-right"></i></li>
            <li>
                <p class="text-caption-01 text-white-50">
                    {{ $service->getTranslation('name', $locale) }}
                </p>
            </li>
        </ul>
        <h1 class="page-title text-white font-sora">
            {{ $service->getTranslation('name', $locale) }}
        </h1>
    </div>
</section>
