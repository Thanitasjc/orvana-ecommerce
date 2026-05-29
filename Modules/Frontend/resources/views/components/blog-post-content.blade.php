@php
    $locale = $locale ?? config('locales.default', 'th');
    $publishedDate = $post->published_at?->format('M d, Y');
@endphp

<section class="s-blog-post flat-spacing">
    <div class="container">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <div class="blog-single_content tf-grid-layout">
                    <div class="box-title">
                        <h1 class="blog-name text-primary text-center">
                            {{ $post->getTranslation('title', $locale) }}
                        </h1>
                        <div class="entry-meta text-primary text-body-large d-flex flex-wrap justify-content-center gap-2">
                            @if ($post->author)
                                <div class="meta meta_user">
                                    <i class="icon icon-UserCircle"></i>
                                    <span class="name">{{ $post->author }}</span>
                                </div>
                            @endif
                            @if ($publishedDate)
                                <div class="br-line type-vertical d-none d-sm-block"></div>
                                <div class="meta meta_user">
                                    <i class="icon icon-CalendarBlank"></i>
                                    <span class="name">{{ $publishedDate }}</span>
                                </div>
                            @endif
                        </div>
                    </div>

                    @if ($post->image)
                        <div class="image">
                            <img loading="lazy" width="850" height="478"
                                src="{{ $post->mediaUrl(fallback: asset('assets/images/blog/single/single-1.jpg')) }}"
                                alt="{{ $post->getTranslation('title', $locale) }}">
                        </div>
                    @endif

                    @if ($post->getTranslation('excerpt', $locale))
                        <div class="box-text">
                            <p class="text-body-large">
                                {{ $post->getTranslation('excerpt', $locale) }}
                            </p>
                        </div>
                    @endif

                    @if ($post->getTranslation('content', $locale))
                        <div class="blog-cms-content text-primary">
                            {!! $post->getTranslation('content', $locale) !!}
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</section>
