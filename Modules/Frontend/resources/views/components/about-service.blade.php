@php
    $locale = $locale ?? config('locales.default', 'th');
    $services = $services ?? collect();
@endphp

@if ($services->isNotEmpty())
    <div class="section-service flat-spacing-3 bg-primary">
        <div class="container-full-2">
            <div class="swiper tf-swiper" data-preview="4" data-tablet="3" data-mobile-sm="2" data-mobile="1"
                data-space-lg="40" data-space-md="30" data-space="15" data-pagination="1" data-pagination-sm="2"
                data-pagination-md="3" data-pagination-lg="4">
                <div class="swiper-wrapper">
                    @foreach ($services as $service)
                        @php
                            $serviceUrl = route('frontend.services.show', $service->slug);
                            $serviceName = $service->getTranslation('name', $locale);
                        @endphp
                        <div class="swiper-slide">
                            <div class="wg-category-v03 style-2">
                                <div class="cate-image">
                                    <img loading="lazy" width="420" height="315"
                                        src="{{ $service->mediaUrl(fallback: asset('assets/images/service/service-1.jpg')) }}"
                                        alt="{{ $serviceName }}">
                                    <a href="{{ $serviceUrl }}"
                                        class="action tf-btn-text-icon style-white animate-btn animate-dark fw-semibold">
                                        View Services
                                        <span class="ic-wrap">
                                            <i class="icon icon-ArrowUpRight"></i>
                                        </span>
                                    </a>
                                </div>
                                <div class="cate-content">
                                    <a href="{{ $serviceUrl }}"
                                        class="cate_name h4 fw-medium link-underline-white text-white">
                                        {{ $serviceName }}
                                    </a>
                                    @if ($service->getTranslation('short_description', $locale))
                                        <p class="cate_desc text-white">
                                            {{ $service->getTranslation('short_description', $locale) }}
                                        </p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
@endif
