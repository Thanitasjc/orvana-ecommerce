@php
    $locale = $locale ?? config('locales.default', 'th');
    $services = $services ?? collect();
    $serviceName = $service->getTranslation('name', $locale);
    $shortDesc = $service->getTranslation('short_description', $locale);
    $description = $service->getTranslation('description', $locale);
@endphp

<section class="section-service-detail flat-spacing">
    <div class="container">
        <div class="row">
            <div class="col-lg-8">
                <div class="detail-main mb-lg-0">
                    <div class="service-image">
                        <img loading="lazy" width="850" height="478"
                            src="{{ $service->mediaUrl(fallback: asset('assets/images/service/detail/service-detail.jpg')) }}"
                            alt="{{ $serviceName }}">
                    </div>
                    <div class="box-text">
                        <h4 class="title text-primary">{{ $serviceName }}</h4>
                        <div class="wrap-text">
                            @if ($shortDesc)
                                <p class="text text-body-large">{{ $shortDesc }}</p>
                            @endif
                            @if ($description)
                                <div class="text text-body-large cms-content">
                                    {!! $description !!}
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="col-right_sidebar">
                    @if ($services->isNotEmpty())
                        <div class="sidebar-service">
                            <h5 class="title text-primary">Choose Any Services</h5>
                            <ul class="list">
                                @foreach ($services as $item)
                                    <li>
                                        <a href="{{ route('frontend.services.show', $item->slug) }}"
                                            class="link-primary link-underline fw-semibold {{ $item->id === $service->id ? 'text-secondary' : '' }}">
                                            {{ $item->getTranslation('name', $locale) }}
                                        </a>
                                    </li>
                                @endforeach
                            </ul>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</section>
