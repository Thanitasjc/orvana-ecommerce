@php
    $locale = $locale ?? config('locales.default', 'th');
    $services = $services ?? collect();
@endphp

@if ($services->isNotEmpty())
    <section class="section-service-provide flat-spacing">
        <div class="container">
            <div class="sect-head text-center">
                <h2 class="s-title mb-16 text-primary wow fadeInUp">Our Services</h2>
                <p class="s-desc text-body-large wow fadeInUp">
                    บริการจากฟาร์มของเรา — ดูแลทุกขั้นตอนตั้งแต่ปลูกจนถึงจัดส่ง
                </p>
            </div>
            <div class="tf-grid-layout sm-col-2 xl-col-3">
                @foreach ($services as $service)
                    @php
                        $serviceUrl = route('frontend.services.show', $service->slug);
                        $serviceName = $service->getTranslation('name', $locale);
                    @endphp
                    <div class="card-service-v01 hover-img4 wow fadeInUp">
                        <a href="{{ $serviceUrl }}" class="card-image img-style4">
                            <img loading="lazy" width="724" height="543"
                                src="{{ $service->mediaUrl(fallback: asset('assets/images/service/service-2_1.jpg')) }}"
                                alt="{{ $serviceName }}">
                        </a>
                        <div class="card-content">
                            <a href="{{ $serviceUrl }}" class="name text-primary h4 fw-medium link-underline">
                                {{ $serviceName }}
                            </a>
                            @if ($service->getTranslation('short_description', $locale))
                                <p class="desc">
                                    {{ $service->getTranslation('short_description', $locale) }}
                                </p>
                            @endif
                        </div>
                        <a href="{{ $serviceUrl }}" class="tf-btn-line style-min p-0">View Services</a>
                    </div>
                @endforeach
            </div>
            <div class="text-center mt-4 wow fadeInUp">
                <a href="{{ route('frontend.services.index') }}" class="tf-btn style-btn-fill-pri animate-btn animate-dark">
                    <span class="fw-semibold text-caption-01">View All Services</span>
                </a>
            </div>
        </div>
    </section>
@endif
