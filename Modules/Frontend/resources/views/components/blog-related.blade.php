@php
    $locale = $locale ?? config('locales.default', 'th');
@endphp

@if (($relatedPosts ?? collect())->isNotEmpty())
    <section class="flat-spacing pt-0">
        <div class="container">
            <div class="sect-head text-center">
                <h3 class="s-title text-primary mb-12">Related Articles</h3>
            </div>
            <div dir="ltr" class="swiper tf-swiper" data-preview="3" data-tablet="3" data-mobile-sm="2"
                data-mobile="1" data-space-lg="30" data-space-md="15" data-space="10" data-pagination="1"
                data-pagination-sm="2" data-pagination-md="3" data-pagination-lg="3">
                <div class="swiper-wrapper">
                    @foreach ($relatedPosts as $post)
                        <div class="swiper-slide">
                            @include('frontend::components.partials.blog-card', [
                                'post' => $post,
                                'locale' => $locale,
                            ])
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </section>
@endif
