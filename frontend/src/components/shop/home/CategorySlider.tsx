/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/components/shop/cart/CartProvider";
import { LoopCarousel } from "@/components/shop/home/LoopCarousel";

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
  const safeItems = useMemo(() => items.filter((item) => item.image), [items]);
  const { addItem } = useCart();
  const parsePrice = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0;
  const makeCartId = (value: string) =>
    Math.abs(
      Array.from(value).reduce((acc, ch) => {
        return (acc * 31 + ch.charCodeAt(0)) % 2147483647;
      }, 7),
    );

  if (safeItems.length === 0) return null;

  const slides = safeItems.map((item, itemIndex) => (
    <div className="tp-category-item-2 p-relative z-index-1 text-center" key={`${item.title}-${itemIndex}`}>
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
  ));

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
              <LoopCarousel
                slides={slides}
                slidesPerView={5}
                gap={24}
                slideClassName="swiper-slide"
                ariaLabel="Categories"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
