"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type HeroSlide = {
  image: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

type HeroBannerProps = {
  slides?: HeroSlide[];
};

const defaultSlides: HeroSlide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=2000",
    title: "Apple Style Ecommerce",
    subtitle: "ประสบการณ์ช้อปปิ้งระดับพรีเมียม พร้อมสินค้าและโปรโมชั่นพิเศษ",
    ctaLabel: "Shop Now",
    ctaUrl: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=2000",
    title: "New Collection 2026",
    subtitle: "ดีไซน์เรียบหรู พร้อมเทคโนโลยีล่าสุดสำหรับทุกไลฟ์สไตล์",
    ctaLabel: "Explore",
    ctaUrl: "/shop",
  },
  {
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=2000",
    title: "Premium Accessories",
    subtitle: "อุปกรณ์เสริมคุณภาพสูง สวยงามและใช้งานได้จริง",
    ctaLabel: "Discover",
    ctaUrl: "/shop",
  },
];

export function HeroBanner({ slides = defaultSlides }: HeroBannerProps) {
  const validSlides = useMemo(() => slides.filter((slide) => slide.image), [slides]);
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
      {validSlides.map((slide, index) => (
        <div
          className={`slide ${index === activeIndex ? "active" : ""}`}
          key={index}
        >
          <img src={slide.image} alt={slide.title ?? `banner-${index + 1}`} />
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
      ))}

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

