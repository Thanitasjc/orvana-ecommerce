@php
    $locale = $locale ?? config('locales.default', 'th');
    $services = $services ?? collect();
@endphp

<section class="section-service-provide flat-spacing">
    <div class="container">
        <div class="sect-head text-center">
            <h2 class="s-title mb-16 text-primary">Services We Provide</h2>
            <p class="s-desc text-body-large">
                Discover our range of farm services designed to support sustainable growth.
            </p>
        </div>
        @if ($services->isNotEmpty())
            <div class="tf-grid-layout sm-col-2 xl-col-3">
                @foreach ($services as $service)
                    @php
                        $serviceUrl = route('frontend.services.show', $service->slug);
                        $serviceName = $service->getTranslation('name', $locale);
                    @endphp
                    <div class="card-service-v01 hover-img4">
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
        @else
            <p class="text-center text-body-large py-5">
                ยังไม่มีบริการ — เพิ่มได้ที่ Admin → บริการ (เปิด <strong>แสดงผล</strong>)
            </p>
        @endif
    </div>
</section>
