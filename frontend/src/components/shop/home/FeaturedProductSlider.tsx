"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDragSlider } from "@/lib/hooks/useDragSlider";

type FeaturedItem = {
  id: string;
  title: string;
  image: string;
  href: string;
  price: string;
  oldPrice?: string;
};

type FeaturedProductSliderProps = {
  items?: FeaturedItem[];
  sectionTitle?: string;
};

const defaultItems: FeaturedItem[] = [
  {
    id: "f-1",
    title: "Clothing Collection 2023",
    image: "/assets/img/product/slider/product-slider-1.jpg",
    href: "/products/featured-1",
    price: "$102.00",
    oldPrice: "$226.00",
  },
  {
    id: "f-2",
    title: "Non Slip Athletic Tennis Walking",
    image: "/assets/img/product/slider/product-slider-2.jpg",
    href: "/products/featured-2",
    price: "$220.00",
    oldPrice: "$350.00",
  },
  {
    id: "f-3",
    title: "Vera Bradley Straw Tote Bag",
    image: "/assets/img/product/slider/product-slider-3.jpg",
    href: "/products/featured-3",
    price: "$46.00",
    oldPrice: "$96.00",
  },
  {
    id: "f-4",
    title: "Gucci Women’s Black Leather Bag",
    image: "/assets/img/product/slider/product-slider-4.jpg",
    href: "/products/featured-4",
    price: "$102.00",
    oldPrice: "$226.00",
  },
  {
    id: "f-5",
    title: "Mens Jacket Premium Cotton",
    image: "/assets/img/product/slider/product-slider-5.jpg",
    href: "/products/featured-5",
    price: "$45.00",
    oldPrice: "$98.00",
  },
];

export function FeaturedProductSlider({
  items = defaultItems,
  sectionTitle = "This Week's Featured",
}: FeaturedProductSliderProps) {
  const [index, setIndex] = useState(0);
  const safeItems = useMemo(() => items.filter((item) => item.image), [items]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const SLIDE_WIDTH = 612;
  const GAP = 8;
  const step = SLIDE_WIDTH + GAP;
  const trackWidth =
    safeItems.length * SLIDE_WIDTH + Math.max(0, safeItems.length - 1) * GAP;
  const maxTranslate = Math.max(0, trackWidth - containerWidth);
  const maxIndex = Math.ceil(maxTranslate / step);
  const translate = Math.min(index * step, maxTranslate);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (index > maxIndex) setIndex(maxIndex);
  }, [index, maxIndex]);

  const prev = () => setIndex((prevIndex) => Math.max(0, prevIndex - 1));
  const next = () => setIndex((prevIndex) => Math.min(maxIndex, prevIndex + 1));

  const { dragOffset, isDragging, dragProps } = useDragSlider({
    viewportRef: containerRef,
    stepPx: step,
    index,
    maxIndex,
    setIndex,
  });

  if (safeItems.length === 0) return null;

  return (
    <section className="tp-featured-slider-area grey-bg-6 fix pt-95 pb-120">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 mb-50">
              <span className="tp-section-title-pre-2">
                Shop by Category
                <svg
                  width="82"
                  height="22"
                  viewBox="0 0 82 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M81 14.5798C0.890564 -8.05914 -5.81154 0.0503902 5.00322 21"
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeWidth="2"
                    strokeMiterlimit="3.8637"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <h3 className="tp-section-title-2">{sectionTitle}</h3>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="tp-featured-slider">
              <div
                ref={containerRef}
                className="tp-featured-slider-active swiper-container"
                style={{
                  overflow: "hidden",
                }}
              >
                <div
                  className="swiper-wrapper"
                  onPointerDown={dragProps.onPointerDown}
                  onClickCapture={dragProps.onClickCapture}
                  style={{
                    display: "flex",
                    gap: `${GAP}px`,
                    alignItems: "stretch",
                    transform: `translate3d(calc(-${translate}px + ${dragOffset}px), 0, 0)`,
                    transition: isDragging ? "none" : "transform 0.5s ease",
                    ...dragProps.style,
                  }}
                >
                  {safeItems.map((item) => (
                    <div
                      key={item.id}
                      className="tp-featured-item swiper-slide white-bg p-relative z-index-1"
                      style={{
                        flex: "0 0 612px",
                        minHeight: "380px",
                      }}
                    >
                      <div
                        className="tp-featured-thumb include-bg"
                        style={{
                          backgroundImage: `url(${item.image})`,
                          minHeight: "380px",
                        }}
                      />
                      <div className="tp-featured-content">
                        <h3 className="tp-featured-title">
                          <Link href={item.href}>{item.title}</Link>
                        </h3>
                        <div className="tp-featured-price-wrapper">
                          <span className="tp-featured-price new-price">{item.price}</span>
                          {item.oldPrice ? (
                            <span className="tp-featured-price old-price">{item.oldPrice}</span>
                          ) : null}
                        </div>
                        <div className="tp-product-rating-icon tp-product-rating-icon-2">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <span key={`${item.id}-star-${starIndex}`}>
                              <i className="fa-solid fa-star" />
                            </span>
                          ))}
                        </div>
                        <div className="tp-featured-btn">
                          <Link href={item.href} className="tp-btn tp-btn-border tp-btn-border-sm">
                            Shop Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="tp-featured-slider-arrow mt-45">
                <button className="tp-featured-slider-button-prev" type="button" onClick={prev}>
                  <svg width="33" height="16" viewBox="0 0 33 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1.97974 7.97534L31.9797 7.97534"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.02954 0.999999L0.999912 7.99942L8.02954 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button className="tp-featured-slider-button-next" type="button" onClick={next}>
                  <svg width="33" height="16" viewBox="0 0 33 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M30.9795 7.97534L0.979492 7.97534"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M24.9297 0.999999L31.9593 7.99942L24.9297 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

