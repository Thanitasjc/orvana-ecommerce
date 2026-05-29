<section class="section flat-spacing">
    <div class="container">
        <div class="banner-v01">
            <div class="banner-content text-center text-md-start wow fadeInUp">
                <h2 class="b-title text-primary">
                    @if ($ctaBanner ?? null)
                        {{ $ctaBanner->getTranslation('title', $locale ?? 'th') }}
                    @else
                        Fresh From The Farm Delivered To Your Door!
                    @endif
                </h2>
                <p class="b-desc text-body-large">
                    @if ($ctaBanner ?? null)
                        {{ $ctaBanner->getTranslation('subtitle', $locale ?? 'th') }}
                    @else
                        Shop clean, organic vegetables grown without chemicals – always fresh, safe, nutrient-rich,
                        and full of natural flavor.
                    @endif
                </p>
                <a href="{{ ($ctaBanner ?? null)?->button_url ?: route('frontend.shop.left-sidebar') }}"
                    class="tf-btn style-btn-fill-sec style-large animate-btn animate-dark fw-semibold">
                    @if ($ctaBanner ?? null)
                        {{ $ctaBanner->getTranslation('button_text', $locale ?? 'th') ?: 'Shop Now' }}
                    @else
                        Shop Now
                    @endif
                </a>
            </div>
            <div class="banner-image">
                <img loading="lazy" width="794" height="480"
                    src="{{ ($ctaBanner ?? null)?->mediaUrl(fallback: asset('assets/images/section/banner-1.jpg')) ?: asset('assets/images/section/banner-1.jpg') }}"
                    alt="Banner">
            </div>
        </div>
    </div>
</section>
