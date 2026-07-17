"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { StorefrontHeroSlide } from "@/lib/api/cms";
import { youtubeBackgroundEmbedUrl } from "@/lib/cms/youtube";

type HeroBannerProps = {
  slides?: StorefrontHeroSlide[];
};

const defaultSlides: StorefrontHeroSlide[] = [
  {
    mediaType: "image",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=2000",
    title: "Apple Style Ecommerce",
    subtitle: "ประสบการณ์ช้อปปิ้งระดับพรีเมียม พร้อมสินค้าและโปรโมชั่นพิเศษ",
    ctaLabel: "Shop Now",
    ctaUrl: "/shop",
  },
  {
    mediaType: "image",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=2000",
    title: "New Collection 2026",
    subtitle: "ดีไซน์เรียบหรู พร้อมเทคโนโลยีล่าสุดสำหรับทุกไลฟ์สไตล์",
    ctaLabel: "Explore",
    ctaUrl: "/shop",
  },
  {
    mediaType: "image",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=2000",
    title: "Premium Accessories",
    subtitle: "อุปกรณ์เสริมคุณภาพสูง สวยงามและใช้งานได้จริง",
    ctaLabel: "Discover",
    ctaUrl: "/shop",
  },
];

function isRenderableSlide(slide: StorefrontHeroSlide) {
  if (slide.mediaType === "youtube") {
    return Boolean(slide.youtubeId);
  }
  return Boolean(slide.image);
}

function hasOverlayContent(slide: StorefrontHeroSlide) {
  return Boolean(slide.badge || slide.title || slide.titleHighlight || slide.subtitle || slide.ctaLabel);
}

function HeroOverlay({ slide }: { slide: StorefrontHeroSlide }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-start justify-center gap-3 px-5 py-10 text-left md:gap-4 md:px-12 md:py-12 lg:px-20">
      <div className="w-full max-w-7xl">
        {slide.badge && (
          <span className="mb-3 inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm md:text-sm">
            {slide.badge}
          </span>
        )}
        {(slide.title || slide.titleHighlight) && (
          <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl">
            {slide.title}
            {slide.titleHighlight && (
              <>
                {slide.title ? " " : ""}
                <span className="text-amber-400">{slide.titleHighlight}</span>
              </>
            )}
          </h1>
        )}
        {slide.subtitle && (
          <p className="mt-3 max-w-xl text-sm text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] md:mt-4 md:text-lg">
            {slide.subtitle}
          </p>
        )}
        {slide.ctaLabel && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={slide.ctaUrl ?? "/shop"}
              className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-[#003366] transition hover:bg-gray-100 md:px-6 md:py-3"
            >
              {slide.ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroBanner({ slides = defaultSlides }: HeroBannerProps) {
  const validSlides = useMemo(() => slides.filter(isRenderableSlide), [slides]);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = validSlides.length;

  const goTo = useCallback((index: number) => setActiveIndex(index), []);
  const goPrev = useCallback(
    () => setActiveIndex((prev) => (prev - 1 + count) % count),
    [count],
  );
  const goNext = useCallback(
    () => setActiveIndex((prev) => (prev + 1) % count),
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [count]);

  useEffect(() => {
    if (activeIndex >= count) setActiveIndex(0);
  }, [activeIndex, count]);

  if (count === 0) return null;

  return (
    <section className="group relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-slate-900">
      {validSlides.map((slide, index) => {
        const isActive = index === activeIndex;
        const isYoutube = slide.mediaType === "youtube" && slide.youtubeId;
        const overlay = hasOverlayContent(slide);
        const slideClass = isActive
          ? "relative z-10 opacity-100"
          : "pointer-events-none absolute inset-x-0 top-0 z-0 opacity-0";

        return (
          <div
            key={`${slide.mediaType}-${slide.youtubeId ?? slide.image}-${index}`}
            className={`w-full transition-opacity duration-500 ease-out ${slideClass}`}
            aria-hidden={!isActive}
          >
            {isYoutube ? (
              <div className="relative aspect-square min-h-[min(72vh,720px)] w-full overflow-hidden bg-slate-900 md:aspect-[16/5]">
                <div className="absolute inset-0 overflow-hidden">
                  <iframe
                    src={isActive ? youtubeBackgroundEmbedUrl(slide.youtubeId!) : undefined}
                    title={slide.title ?? `hero-video-${index + 1}`}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-[120%] w-[177.78vh] min-w-[120%] -translate-x-1/2 -translate-y-1/2 scale-[1.25] border-0 md:scale-[1.35]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    tabIndex={-1}
                  />
                </div>
                <div
                  className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55"
                  aria-hidden="true"
                />
                {overlay && <HeroOverlay slide={slide} />}
              </div>
            ) : (
              <div className="relative w-full">
                {slide.ctaUrl && !overlay ? (
                  <Link href={slide.ctaUrl} className="block w-full leading-[0]">
                    <img
                      src={slide.image}
                      alt={slide.title ?? `banner-${index + 1}`}
                      className="block h-auto w-full max-w-full"
                      draggable={false}
                    />
                  </Link>
                ) : (
                  <img
                    src={slide.image}
                    alt={slide.title ?? `banner-${index + 1}`}
                    className="block h-auto w-full max-w-full"
                    draggable={false}
                  />
                )}
                {overlay && (
                  <>
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent"
                      aria-hidden="true"
                    />
                    <HeroOverlay slide={slide} />
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {count > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center gap-2">
          {validSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Slide ${index + 1}`}
              onClick={() => goTo(index)}
              className={`pointer-events-auto h-2.5 w-2.5 rounded-full shadow transition ${
                index === activeIndex ? "bg-white" : "bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-600 shadow transition hover:bg-white md:left-6 md:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-600 shadow transition hover:bg-white md:right-6 md:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
