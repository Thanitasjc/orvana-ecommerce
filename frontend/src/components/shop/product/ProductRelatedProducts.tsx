"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/shop/cart/CartProvider";
import type { ApiProduct } from "@/lib/api/products";
import { defaultProductImageForId, formatPriceTHB, productHref, productImage } from "@/lib/api/products";

type ProductRelatedProductsProps = {
  products: ApiProduct[];
};

export function ProductRelatedProducts({ products }: ProductRelatedProductsProps) {
  const { addItem } = useCart();
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const scrollbarRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef(0);

  const items = useMemo(() => products.filter((product) => product.slug), [products]);
  const slidesPerView = 4;
  const maxStartIndex = Math.max(0, items.length - slidesPerView);

  useEffect(() => {
    if (index > maxStartIndex) setIndex(maxStartIndex);
  }, [index, maxStartIndex]);

  const updateDragProgress = useCallback(
    (clientX: number) => {
      const bar = scrollbarRef.current;
      if (!bar || maxStartIndex <= 0) return;

      const rect = bar.getBoundingClientRect();
      const thumbWidth = (slidesPerView / items.length) * rect.width;
      const trackWidth = rect.width - thumbWidth;
      const next = Math.min(Math.max((clientX - rect.left - dragOffsetRef.current) / trackWidth, 0), 1);
      setDragProgress(next);
    },
    [items.length, maxStartIndex, slidesPerView],
  );

  useEffect(() => {
    if (!isDragging) return;

    function handleMove(event: MouseEvent) {
      updateDragProgress(event.clientX);
    }

    function handleUp(event: MouseEvent) {
      const bar = scrollbarRef.current;
      if (bar && maxStartIndex > 0) {
        const rect = bar.getBoundingClientRect();
        const thumbWidth = (slidesPerView / items.length) * rect.width;
        const trackWidth = rect.width - thumbWidth;
        const next = Math.min(Math.max((event.clientX - rect.left - dragOffsetRef.current) / trackWidth, 0), 1);
        setIndex(Math.round(next * maxStartIndex));
      }
      setIsDragging(false);
      setDragProgress(null);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging, items.length, maxStartIndex, slidesPerView, updateDragProgress]);

  if (items.length === 0) return null;

  const effectiveIndex = isDragging && dragProgress !== null ? dragProgress * maxStartIndex : index;
  const trackWidth = (items.length / slidesPerView) * 100;
  const translatePercent = (effectiveIndex / items.length) * 100;
  const scrollbarWidth = (slidesPerView / items.length) * 100;
  const scrollbarLeft = maxStartIndex > 0 ? (effectiveIndex / maxStartIndex) * (100 - scrollbarWidth) : 0;

  return (
    <section className="tp-related-product pt-95 pb-120">
      <div className="container">
        <div className="row">
          <div className="tp-section-title-wrapper-6 text-center mb-40">
            <span className="tp-section-title-pre-6">สินค้าในหมวดเดียวกัน</span>
            <h3 className="tp-section-title-6">Related Products</h3>
          </div>
        </div>

        <div className="row">
          <div className="tp-product-related-slider">
            <div className="tp-product-related-slider-active swiper-container mb-10" style={{ overflow: "hidden" }}>
              <div
                className="swiper-wrapper"
                style={{
                  display: "flex",
                  width: `${trackWidth}%`,
                  transform: `translateX(-${translatePercent}%)`,
                  transition: isDragging ? "none" : "transform 0.35s ease",
                }}
              >
                {items.map((product) => {
                  const image = productImage(product, defaultProductImageForId(product.id));
                  const href = productHref(product.slug);

                  return (
                    <div
                      key={product.id}
                      className="swiper-slide"
                      style={{ flex: `0 0 ${100 / items.length}%`, maxWidth: `${100 / items.length}%` }}
                    >
                      <div className="tp-product-item-3 tp-product-style-primary mb-50">
                        <div className="tp-product-thumb-3 mb-15 fix p-relative z-index-1">
                          <Link href={href}>
                            <img src={image} alt={product.name} />
                          </Link>

                          <div className="tp-product-action-3 tp-product-action-4 has-shadow tp-product-action-primaryStyle">
                            <div className="tp-product-action-item-3 d-flex flex-column">
                              <button
                                type="button"
                                className="tp-product-action-btn-3 tp-product-add-cart-btn"
                                onClick={() =>
                                  addItem({
                                    id: product.id,
                                    title: product.name,
                                    href,
                                    image,
                                    price: product.price,
                                    quantity: 1,
                                  })
                                }
                              >
                                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M3.34706 4.53799L3.85961 10.6239C3.89701 11.0923 4.28036 11.4436 4.74871 11.4436H14.0282C14.8493 11.1144 14.9122 10.6774L15.7197 5.11162C15.7384 4.97924 15.7053 4.84687 15.6245 4.73995C15.5446 4.63218 15.4273 4.5626 15.2947 4.54393C15.1171 4.55072 7.74498 4.54054 3.34706 4.53799ZM4.74722 12.7162C3.62777 12.7162 2.68001 11.8438 2.58906 10.728L1.81046 1.4837L0.529505 1.26308C0.181854 1.20198 -0.0501969 0.873587 0.00930333 0.526523C0.0705036 0.17946 0.406255 -0.0462578 0.746256 0.00805037L2.51426 0.313534C2.79901 0.363599 3.01576 0.5995 3.04042 0.888012L3.24017 3.26484C15.3748 3.26993 15.4139 3.27587 15.4726 3.28266C15.946 3.3514 16.3625 3.59833 16.6464 3.97849C16.9303 4.35779 17.0493 4.82535 16.9813 5.29376L16.1747 10.8586C16.0225 11.9177 15.1011 12.7162 14.0301 12.7162H4.74722Z"
                                    fill="currentColor"
                                  />
                                </svg>
                                <span className="tp-product-tooltip">Add to Cart</span>
                              </button>
                              <Link href={href} className="tp-product-action-btn-3 tp-product-quick-view-btn">
                                <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M8.99948 5.06828C7.80247 5.06828 6.82956 6.04044 6.82956 7.23542C6.82956 8.42951 7.80247 9.40077 8.99948 9.40077C10.1965 9.40077 11.1703 8.42951 11.1703 7.23542C11.1703 6.04044 10.1965 5.06828 8.99948 5.06828ZM8.99942 10.7482C7.0581 10.7482 5.47949 9.17221 5.47949 7.23508C5.47949 5.29705 7.0581 3.72021 8.99942 3.72021C10.9407 3.72021 12.5202 5.29705 12.5202 7.23508C12.5202 9.17221 10.9407 10.7482 8.99942 10.7482Z"
                                    fill="currentColor"
                                  />
                                </svg>
                                <span className="tp-product-tooltip">View Product</span>
                              </Link>
                            </div>
                          </div>

                          <div className="tp-product-add-cart-btn-large-wrapper">
                            <button
                              type="button"
                              className="tp-product-add-cart-btn-large"
                              onClick={() =>
                                addItem({
                                  id: product.id,
                                  title: product.name,
                                  href,
                                  image,
                                  price: product.price,
                                  quantity: 1,
                                })
                              }
                            >
                              Add To Cart
                            </button>
                          </div>
                        </div>

                        <div className="tp-product-content-3">
                          <div className="tp-product-tag-3">
                            <span>{product.category?.name ?? "AESTHETE"}</span>
                          </div>
                          <h3 className="tp-product-title-3">
                            <Link href={href}>{product.name}</Link>
                          </h3>
                          <div className="tp-product-price-wrapper-3">
                            <span className="tp-product-price-3 new-price">{formatPriceTHB(product.price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {items.length > slidesPerView ? (
              <div
                ref={scrollbarRef}
                className="tp-related-swiper-scrollbar tp-swiper-scrollbar"
                onMouseDown={(event) => {
                  const bar = scrollbarRef.current;
                  if (!bar) return;
                  const rect = bar.getBoundingClientRect();
                  const thumbWidth = (slidesPerView / items.length) * rect.width;
                  const thumbLeft = (index / maxStartIndex) * (rect.width - thumbWidth);
                  dragOffsetRef.current = event.clientX - rect.left - thumbLeft;
                  setIsDragging(true);
                  updateDragProgress(event.clientX);
                }}
              >
                <div
                  className="tp-swiper-scrollbar-drag"
                  style={{
                    width: `${scrollbarWidth}%`,
                    left: `${scrollbarLeft}%`,
                    position: "relative",
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
