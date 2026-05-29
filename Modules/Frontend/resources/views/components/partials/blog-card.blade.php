@php
    $locale = $locale ?? config('locales.default', 'th');
    $publishedDate = $post->published_at?->format('M d, Y');
@endphp

<div class="article-blog hover-img4">
    <a href="{{ route('frontend.blog.show', $post->slug) }}" class="entry-image img-style4">
        <img loading="lazy" width="410" height="273"
            src="{{ $post->mediaUrl(fallback: asset('assets/images/blog/blog-5.jpg')) }}"
            alt="{{ $post->getTranslation('title', $locale) }}">
    </a>
    <div class="entry-content">
        <div class="box-head">
            <div class="entry_meta">
                @if ($publishedDate)
                    <p class="date cl-text-2">{{ $publishedDate }}</p>
                    <div class="br-line"></div>
                @endif
                @if ($post->author)
                    <div class="badge-tag text-label">
                        {{ strtoupper($post->author) }}
                    </div>
                @endif
            </div>
            <h5 class="entry_title">
                <a href="{{ route('frontend.blog.show', $post->slug) }}" class="text-primary font-sora">
                    {{ $post->getTranslation('title', $locale) }}
                </a>
            </h5>
        </div>
        @if ($post->getTranslation('excerpt', $locale))
            <p class="entry_desc">
                {{ $post->getTranslation('excerpt', $locale) }}
            </p>
        @endif
        <a href="{{ route('frontend.blog.show', $post->slug) }}" class="tf-btn-line">
            Read More
        </a>
    </div>
</div>
