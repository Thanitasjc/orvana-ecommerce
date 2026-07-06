"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { StorefrontHeroSlide } from "@/lib/api/cms";
import { youtubeEmbedUrl } from "@/lib/cms/youtube";

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
    ctaUrl: "#",
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

export function HeroBanner({ slides = defaultSlides }: HeroBannerProps) {
  const validSlides = useMemo(() => slides.filter(isRenderableSlide), [slides]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (validSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % validSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [validSlides.length]);

  useEffect(() => {
    if (activeIndex >= validSlides.length) setActiveIndex(0);
  }, [activeIndex, validSlides.length]);

  if (validSlides.length === 0) return null;

  return (
    <section className="hero-slider">
      {validSlides.map((slide, index) => {
        const isActive = index === activeIndex;
        const isYoutube = slide.mediaType === "youtube" && slide.youtubeId;

        return (
          <div className={`slide ${isActive ? "active" : ""}`} key={`${slide.mediaType}-${slide.youtubeId ?? slide.image}-${index}`}>
            <div className="hero-media">
              {isYoutube ? (
                <iframe
                  className="hero-youtube"
                  src={isActive ? youtubeEmbedUrl(slide.youtubeId!) : undefined}
                  title={slide.title ?? `hero-youtube-${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <img src={slide.image} alt={slide.title ?? `banner-${index + 1}`} />
              )}
            </div>
            <div className="hero-content">
              {slide.title && <h1>{slide.title}</h1>}
              {slide.subtitle && <p>{slide.subtitle}</p>}
              {slide.ctaLabel && (
                <Link href={slide.ctaUrl ?? "/shop"} className="btn">
                  {slide.ctaLabel}
                </Link>
              )}
            </div>
          </div>
        );
      })}

      {validSlides.length > 1 && (
        <div className="slider-dots">
          {validSlides.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === activeIndex ? "active" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActiveIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
