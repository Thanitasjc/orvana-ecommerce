"use client";

import Link from "next/link";
import { useMemo } from "react";
import { LoopCarousel } from "@/components/shop/home/LoopCarousel";

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
  const safeItems = useMemo(() => items.filter((item) => item.image), [items]);

  if (safeItems.length === 0) return null;

  const slides = safeItems.map((item) => (
    <div key={item.id} className="tp-featured-item white-bg p-relative z-index-1" style={{ minHeight: "380px", height: "100%" }}>
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
  ));

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
              <LoopCarousel
                slides={slides}
                slideWidthPx={620}
                gap={8}
                slideClassName="swiper-slide"
                ariaLabel="Featured products"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
