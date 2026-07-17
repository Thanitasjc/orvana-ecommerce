/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/shop/cart/CartProvider";
import { useDragSlider } from "@/lib/hooks/useDragSlider";

type CategoryItem = {
  image: string;
  fromPrice: string;
  title: string;
  href: string;
  productId?: number;
  priceValue?: number;
};

type CategorySliderProps = {
  items?: CategoryItem[];
};

const defaultItems: CategoryItem[] = [
  {
    image: "/assets/img/category/category-1.jpg",
    fromPrice: "From $34.95",
    title: "Crew Neck T-shirt",
    href: "/products/example-1",
  },
  {
    image: "/assets/img/category/category-2.jpg",
    fromPrice: "From $34.95",
    title: "Casual Hoodie",
    href: "/products/example-2",
  },
  {
    image: "/assets/img/category/category-3.jpg",
    fromPrice: "From $34.95",
    title: "Sport Jacket",
    href: "/products/example-3",
  },
  {
    image: "/assets/img/category/category-4.jpg",
    fromPrice: "From $34.95",
    title: "Denim Jeans",
    href: "/products/example-4",
  },
  {
    image: "/assets/img/category/category-5.jpg",
    fromPrice: "From $34.95",
    title: "Leather Bag",
    href: "/products/example-5",
  },
  {
    image: "/assets/img/category/category-6.jpg",
    fromPrice: "From $34.95",
    title: "Running Shoes",
    href: "/products/example-6",
  },
];

export function CategorySlider({ items = defaultItems }: CategorySliderProps) {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const safeItems = useMemo(() => items.filter((item) => item.image), [items]);
  const { addItem } = useCart();
  const scrollbarRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef(0);
  const slidesPerView = 5;
  const maxStartIndex = Math.max(0, safeItems.length - slidesPerView);

  useEffect(() => {
    if (index > maxStartIndex) setIndex(maxStartIndex);
  }, [index, maxStartIndex]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const {
    dragOffset: trackDragOffset,
    isDragging: isTrackDragging,
    dragProps: trackDragProps,
  } = useDragSlider({
    viewportRef,
    slidesPerView,
    index,
    maxIndex: maxStartIndex,
    setIndex,
  });

  if (safeItems.length === 0) return null;

  const effectiveIndex = isDragging && dragProgress !== null ? dragProgress * maxStartIndex : index;
  const trackWidth = (safeItems.length / slidesPerView) * 100;
  const translatePercent = (effectiveIndex / safeItems.length) * 100;
  const scrollbarWidth = (slidesPerView / safeItems.length) * 100;
  const maxThumbLeftPercent = Math.max(0, 100 - scrollbarWidth);
  const normalizedProgress =
    maxStartIndex === 0 ? 0 : isDragging && dragProgress !== null ? dragProgress : index / maxStartIndex;
  const scrollbarPosition = normalizedProgress * maxThumbLeftPercent;
  const parsePrice = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0;
  const makeCartId = (value: string) =>
    Math.abs(
      Array.from(value).reduce((acc, ch) => {
        return (acc * 31 + ch.charCodeAt(0)) % 2147483647;
      }, 7),
    );

  const updateDragProgressFromClientX = useCallback(
    (clientX: number) => {
      const track = scrollbarRef.current;
      if (!track || maxStartIndex <= 0) return;

      const rect = track.getBoundingClientRect();
      const thumbWidthPx = rect.width * (scrollbarWidth / 100);
      const maxLeftPx = Math.max(0, rect.width - thumbWidthPx);
      const rawLeftPx = clientX - rect.left - dragOffsetRef.current;
      const clampedLeftPx = Math.min(Math.max(0, rawLeftPx), maxLeftPx);
      const progress = maxLeftPx === 0 ? 0 : clampedLeftPx / maxLeftPx;
      setDragProgress(progress);
    },
    [maxStartIndex, scrollbarWidth],
  );

  const beginDragAt = useCallback(
    (clientX: number) => {
      const track = scrollbarRef.current;
      if (!track || maxStartIndex <= 0) return;

      const rect = track.getBoundingClientRect();
      const thumbWidthPx = rect.width * (scrollbarWidth / 100);
      const thumbLeftPx = (scrollbarPosition / 100) * rect.width;
      dragOffsetRef.current = Math.min(thumbWidthPx, Math.max(0, clientX - rect.left - thumbLeftPx));
      setIsDragging(true);
      updateDragProgressFromClientX(clientX);
    },
    [maxStartIndex, scrollbarPosition, scrollbarWidth, updateDragProgressFromClientX],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (event: MouseEvent) => {
      updateDragProgressFromClientX(event.clientX);
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) return;
      updateDragProgressFromClientX(event.touches[0].clientX);
    };
    const stopDrag = () => {
      if (dragProgress !== null) {
        setIndex(Math.round(dragProgress * maxStartIndex));
      }
      setDragProgress(null);
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", stopDrag);
    window.addEventListener("touchcancel", stopDrag);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stopDrag);
      window.removeEventListener("touchcancel", stopDrag);
    };
  }, [dragProgress, isDragging, maxStartIndex, updateDragProgressFromClientX]);

  return (
    <section className="tp-category-area pb-95 pt-95">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 text-center mb-50">
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
              <h3 className="tp-section-title-2">Popular on the Shofy store.</h3>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-category-slider-2">
              <div ref={viewportRef} className="tp-category-slider-active-2 swiper-container mb-50" style={{ overflow: "hidden" }}>
                <div
                  className="swiper-wrapper"
                  onPointerDown={trackDragProps.onPointerDown}
                  onClickCapture={trackDragProps.onClickCapture}
                  style={{
                    width: `${trackWidth}%`,
                    display: "flex",
                    transform: `translate3d(calc(-${translatePercent}% + ${trackDragOffset}px), 0, 0)`,
                    transition: isDragging || isTrackDragging ? "none" : "transform 0.5s ease",
                    ...trackDragProps.style,
                  }}
                >
                  {safeItems.map((item, itemIndex) => (
                    <div
                      className="tp-category-item-2 p-relative z-index-1 text-center swiper-slide"
                      key={`${item.title}-${itemIndex}`}
                      style={{ flex: `0 0 ${100 / safeItems.length}%`, padding: "0 12px" }}
                    >
                      <div className="tp-category-thumb-2">
                        <Link href={item.href}>
                          <img src={item.image} alt={item.title} />
                        </Link>
                      </div>
                      <div className="tp-category-content-2">
                        <span>{item.fromPrice}</span>
                        <h3 className="tp-category-title-2">
                          <Link href={item.href}>{item.title}</Link>
                        </h3>
                        <div className="tp-category-btn-2">
                          <button
                            type="button"
                            className="tp-btn tp-btn-border"
                            onClick={() =>
                              addItem({
                                id: item.productId ?? makeCartId(`category-${item.title}`),
                                title: item.title,
                                href: item.href,
                                image: item.image,
                                price: item.priceValue ?? parsePrice(item.fromPrice),
                                quantity: 1,
                              })
                            }
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                ref={scrollbarRef}
                className="swiper-scrollbar tp-swiper-scrollbar tp-swiper-scrollbar-drag"
                style={{ cursor: maxStartIndex > 0 ? "pointer" : "default", touchAction: "pan-y" }}
                onMouseDown={(event) => {
                  beginDragAt(event.clientX);
                }}
                onTouchStart={(event) => {
                  if (event.touches.length === 0) return;
                  beginDragAt(event.touches[0].clientX);
                }}
              >
                <div
                  className="tp-swiper-scrollbar-drag"
                  style={{
                    width: `${scrollbarWidth}%`,
                    position: "relative",
                    left: `${scrollbarPosition}%`,
                    transition: isDragging ? "none" : "left 0.5s ease",
                    cursor: maxStartIndex > 0 ? (isDragging ? "grabbing" : "grab") : "default",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

