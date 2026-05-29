<section class="section-testimonial tf-sw-thumbs">
    <div class="testimonial-v01">
        <div class="swiper sw-thumb bg-primary">
            <div class="swiper-wrapper">
                @forelse ($testimonials ?? [] as $testimonial)
                    <div class="swiper-slide">
                        <div class="tes-image">
                            <img loading="lazy" width="955" height="560"
                                src="{{ $testimonial->mediaUrl(fallback: asset('assets/images/section/banner-tes.jpg')) }}"
                                alt="{{ $testimonial->getTranslation('name', $locale ?? 'th') }}">
                        </div>
                    </div>
                @empty
                    <div class="swiper-slide">
                        <div class="tes-image">
                            <img loading="lazy" width="955" height="560"
                                src="{{ asset('assets/images/section/banner-tes.jpg') }}" alt="Image">
                        </div>
                    </div>
                @endforelse
            </div>
        </div>
        <div class="col-right">
            <div class="swiper sw-main-thumb">
                <div class="swiper-wrapper">
                    @forelse ($testimonials ?? [] as $testimonial)
                        <div class="swiper-slide">
                            <div class="content">
                                <ul class="rate-list gap-2">
                                    @for ($i = 1; $i <= 5; $i++)
                                        <li>
                                            <i class="icon icon-star-4 {{ $i <= ($testimonial->rating ?? 5) ? 'text-white' : '' }}"></i>
                                        </li>
                                    @endfor
                                </ul>
                                <h4 class="tes-text text-white text-capitalize">
                                    "{{ $testimonial->getTranslation('content', $locale ?? 'th') }}"
                                </h4>
                                <h5 class="tes-author text-white">
                                    {{ $testimonial->getTranslation('name', $locale ?? 'th') }}
                                    @if ($testimonial->getTranslation('role', $locale ?? 'th'))
                                        <span class="d-block text-caption-01">{{ $testimonial->getTranslation('role', $locale ?? 'th') }}</span>
                                    @endif
                                </h5>
                            </div>
                        </div>
                    @empty
                        <div class="swiper-slide">
                            <div class="content">
                                <h4 class="tes-text text-white text-capitalize">
                                    "Add testimonials from the admin panel to display them here."
                                </h4>
                            </div>
                        </div>
                    @endforelse
                </div>
            </div>
            @if (count($testimonials ?? []) > 1)
                <div class="tes_thumb">
                    <div class="sw-pg-thumb"></div>
                    <div class="group-btn">
                        <div class="tf-sw-nav style-2 small nav-prev-swiper" role="button" tabindex="0"
                            aria-label="{{ __('Previous slide') }}">
                            <i class="icon icon-caret-left"></i>
                        </div>
                        <div class="tf-sw-nav style-2 small nav-next-swiper" role="button" tabindex="0"
                            aria-label="{{ __('Next slide') }}">
                            <i class="icon icon-caret-right"></i>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>
</section>
