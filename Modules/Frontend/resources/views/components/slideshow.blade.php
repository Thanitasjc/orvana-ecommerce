<div class="tf-slideshow tf-btn-swiper-main hover-sw-nav">
    <div dir="ltr" class="swiper tf-swiper sw-slide-show slider_effect_fade" data-effect="fade"
        data-delay="3000" data-auto="true" data-loop="true" data-preview="1" data-tablet="1" data-mobile="1">
        <div class="swiper-wrapper">
            @forelse ($sliderBanners ?? [] as $banner)
                <div class="swiper-slide">
                    <div class="slider-wrap">
                        <div class="sld_image">
                            <img loading="lazy" width="1920" height="860"
                                src="{{ $banner->mediaUrl(fallback: asset('assets/images/slider/slider-1.jpg')) }}"
                                alt="{{ $banner->getTranslation('title', $locale ?? 'th') }}">
                        </div>
                        <div class="sld_content pst-2">
                            <div class="container">
                                <div class="content-sld_wrap">
                                    <h2 class="title_sld text-display text-white fade-item fade-item-1">
                                        {!! nl2br(e($banner->getTranslation('title', $locale ?? 'th'))) !!}
                                    </h2>
                                    @if ($banner->getTranslation('subtitle', $locale ?? 'th'))
                                        <p class="sub-text_sld text-body-large text-white fade-item fade-item-2">
                                            {{ $banner->getTranslation('subtitle', $locale ?? 'th') }}
                                        </p>
                                    @endif
                                    @if ($banner->button_url)
                                        <div class="fade-item fade-item-3">
                                            <a href="{{ $banner->button_url }}"
                                                class="action_sld tf-btn style-btn-fill-sec animate-btn animate-dark fw-semibold">
                                                {{ $banner->getTranslation('button_text', $locale ?? 'th') ?: 'Read More' }}
                                            </a>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @empty
                <div class="swiper-slide">
                    <div class="slider-wrap">
                        <div class="sld_image">
                            <img loading="lazy" width="1920" height="860"
                                src="{{ asset('assets/images/slider/slider-1.jpg') }}" alt="Slider">
                        </div>
                    </div>
                </div>
            @endforelse
        </div>
        <div class="sw-dot-default style-white tf-sw-pagination"></div>
    </div>

    <div class="group-btn">
        <div class="tf-sw-nav nav-prev-swiper">
            <i class="icon icon-caret-left"></i>
        </div>
        <div class="tf-sw-nav nav-next-swiper">
            <i class="icon icon-caret-right"></i>
        </div>
    </div>
</div>
