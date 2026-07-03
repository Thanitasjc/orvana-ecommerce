 "use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/shop/cart/CartProvider";
import { QuickViewModal, type QuickViewProduct } from "@/components/shop/home/QuickViewModal";

type TrendingItem = {
  id: string;
  image: string;
  title: string;
  href: string;
  tags: string[];
  price: string;
  priceValue?: number;
  productId?: number;
  oldPrice?: string;
};

type TrendingBanner = {
  image: string;
  title: string;
  href: string;
  cta: string;
};

type TrendingArrivalsSectionProps = {
  items?: TrendingItem[];
  banner?: TrendingBanner;
};

const defaultItems: TrendingItem[] = [
  {
    id: "t-1",
    image: "/assets/img/product/trending/trending-1.jpg",
    title: "Brown Gown for Women",
    href: "/products/trending-1",
    tags: ["Whitetails Store"],
    price: "$340.00",
    oldPrice: "$475.00",
  },
  {
    id: "t-2",
    image: "/assets/img/product/trending/trending-2.jpg",
    title: "Strip Shirt For Women (Green)",
    href: "/products/trending-2",
    tags: ["Shirt", "Green"],
    price: "$145.00",
  },
  {
    id: "t-3",
    image: "/assets/img/product/trending/trending-3.jpg",
    title: "Deep Blue Dress",
    href: "/products/trending-3",
    tags: ["Women", "Store"],
    price: "$85.00",
  },
];

const defaultBanner: TrendingBanner = {
  image: "/assets/img/product/trending/banner/trending-banner.jpg",
  title: "Short Sleeve Tunic Tops Casual Swing",
  href: "/shop",
  cta: "Explore More",
};

const actionBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

const actionIconStyle = {
  display: "block",
} as const;

export function TrendingArrivalsSection({
  items = defaultItems,
  banner = defaultBanner,
}: TrendingArrivalsSectionProps) {
  const [page, setPage] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);
  const { addItem } = useCart();
  const pageCount = Math.max(1, items.length);
  const parsePrice = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0;
  const makeCartId = (value: string) =>
    Math.abs(
      Array.from(value).reduce((acc, ch) => {
        return (acc * 31 + ch.charCodeAt(0)) % 2147483647;
      }, 7),
    );
  const visibleItems = useMemo(() => {
    if (items.length <= 2) return items;
    const first = items[page % items.length];
    const second = items[(page + 1) % items.length];
    return [first, second];
  }, [items, page]);

  return (
    <section className="tp-trending-area pt-140 pb-150">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-6">
            <div className="tp-trending-wrapper">
              <div className="tp-section-title-wrapper-2 mb-50">
                <span className="tp-section-title-pre-2">
                  More to Discover
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
                <h3 className="tp-section-title-2">Trending Arrivals</h3>
              </div>

              <div className="tp-trending-slider">
                <div className="tp-trending-slider-active swiper-container">
                  <div
                    className="swiper-wrapper"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      columnGap: "24px",
                    }}
                  >
                    {visibleItems.map((item) => (
                      <div className="tp-trending-item swiper-slide" key={item.id}>
                        <div className="tp-product-item-2">
                          <div className="tp-product-thumb-2 p-relative z-index-1 fix w-img">
                            <Link href={item.href}>
                              <img src={item.image} alt={item.title} />
                            </Link>
                            <div className="tp-product-action-2 tp-product-action-blackStyle">
                              <div className="tp-product-action-item-2 d-flex flex-column">
                                <button
                                  type="button"
                                  className="tp-product-action-btn-2 tp-product-add-cart-btn"
                                  aria-label="Add to cart"
                                  style={actionBtnStyle}
                                  onClick={() =>
                                    addItem({
                                      id: item.productId ?? makeCartId(`trending-${item.id}`),
                                      title: item.title,
                                      href: item.href,
                                      image: item.image,
                                      price: item.priceValue ?? parsePrice(item.price),
                                      quantity: 1,
                                    })
                                  }
                                >
                                  <svg style={actionIconStyle} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M3.34706 4.53799L3.85961 10.6239C3.89701 11.0923 4.28036 11.4436 4.74871 11.4436H4.75212H14.0265H14.0282C14.4711 11.4436 14.8493 11.1144 14.9122 10.6774L15.7197 5.11162C15.7384 4.97924 15.7053 4.84687 15.6245 4.73995C15.5446 4.63218 15.4273 4.5626 15.2947 4.54393C15.1171 4.55072 7.74498 4.54054 3.34706 4.53799Z" fill="currentColor" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12.6629 7.67446H10.3067C9.95394 7.67446 9.66919 7.38934 9.66919 7.03804C9.66919 6.68673 9.95394 6.40161 10.3067 6.40161H12.6629C13.0148 6.40161 13.3004 6.68673 13.3004 7.03804C13.3004 7.38934 13.0148 7.67446 12.6629 7.67446Z" fill="currentColor" />
                                  </svg>
                                  <span className="tp-product-tooltip tp-product-tooltip-right">Add to Cart</span>
                                </button>
                                <button
                                  type="button"
                                  className="tp-product-action-btn-2 tp-product-quick-view-btn"
                                  aria-label="Quick view"
                                  style={actionBtnStyle}
                                  onClick={() =>
                                    setQuickViewProduct({
                                      id: item.id,
                                      title: item.title,
                                      href: item.href,
                                      image: item.image,
                                      price: item.price,
                                      oldPrice: item.oldPrice,
                                      tags: item.tags,
                                    })
                                  }
                                >
                                  <svg style={actionIconStyle} width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8.99948 5.06828C7.80247 5.06828 6.82956 6.04044 6.82956 7.23542C6.82956 8.42951 7.80247 9.40077 8.99948 9.40077C10.1965 9.40077 11.1703 8.42951 11.1703 7.23542C11.1703 6.04044 10.1965 5.06828 8.99948 5.06828Z" fill="currentColor" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M1.41273 7.2346C3.08674 10.9265 5.90646 13.1215 8.99978 13.1224C12.0931 13.1215 14.9128 10.9265 16.5868 7.2346C14.9128 3.54363 12.0931 1.34863 8.99978 1.34773C5.90736 1.34863 3.08674 3.54363 1.41273 7.2346Z" fill="currentColor" />
                                  </svg>
                                  <span className="tp-product-tooltip tp-product-tooltip-right">Quick View</span>
                                </button>
                                <button
                                  type="button"
                                  className="tp-product-action-btn-2 tp-product-add-to-wishlist-btn"
                                  aria-label="Add to wishlist"
                                  style={actionBtnStyle}
                                >
                                  <svg style={actionIconStyle} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M1.60355 7.98635C2.83622 11.8048 7.7062 14.8923 9.0004 15.6565C10.299 14.8844 15.2042 11.7628 16.3973 7.98985C17.1806 5.55102 16.4535 2.46177 13.5644 1.53473C12.1647 1.08741 10.532 1.35966 9.40484 2.22804C9.16921 2.40837 8.84214 2.41187 8.60476 2.23329C7.41078 1.33952 5.85105 1.07778 4.42936 1.53473C1.54465 2.4609 0.820172 5.55014 1.60355 7.98635Z" fill="currentColor" />
                                  </svg>
                                  <span className="tp-product-tooltip tp-product-tooltip-right">
                                    Add To Wishlist
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  className="tp-product-action-btn-2 tp-product-add-to-compare-btn"
                                  aria-label="Add to compare"
                                  style={actionBtnStyle}
                                >
                                  <svg style={actionIconStyle} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.4144 6.16828L14 3.58412L11.4144 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M1.48883 3.58374L14 3.58374" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4.07446 8.32153L1.48884 10.9057L4.07446 13.4898" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M14 10.9058H1.48883" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <span className="tp-product-tooltip tp-product-tooltip-right">Add To Compare</span>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="tp-product-content-2 pt-15">
                            <div className="tp-product-tag-2">
                              {item.tags.map((tag, idx) => (
                                <Link href="/shop" key={`${item.id}-${tag}`}>
                                  {idx < item.tags.length - 1 ? `${tag},` : tag}
                                </Link>
                              ))}
                            </div>
                            <h3 className="tp-product-title-2">
                              <Link href={item.href}>{item.title}</Link>
                            </h3>
                            <div className="tp-product-rating-icon tp-product-rating-icon-2">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <span key={`${item.id}-star-${index}`}>
                                  <i className="fa-solid fa-star" />
                                </span>
                              ))}
                            </div>
                            <div className="tp-product-price-wrapper-2">
                              <span className={`tp-product-price-2 ${item.oldPrice ? "new-price" : ""}`}>
                                {item.price}
                              </span>
                              {item.oldPrice ? (
                                <span className="tp-product-price-2 old-price">{item.oldPrice}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tp-trending-slider-dot tp-swiper-dot text-center mt-45">
                  {Array.from({ length: pageCount }).map((_, idx) => (
                    <button
                      key={`trend-dot-${idx}`}
                      type="button"
                      className={`swiper-pagination-bullet ${idx === page ? "swiper-pagination-bullet-active" : ""}`}
                      aria-label={`Go to trending page ${idx + 1}`}
                      onClick={() => setPage(idx)}
                    >
                      <span className="visually-hidden">{idx + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-5 col-md-8 col-sm-10">
            <div className="tp-trending-banner p-relative ml-35">
              <div
                className="tp-trending-banner-thumb w-img include-bg"
                data-background={banner.image}
                style={{ backgroundImage: `url(${banner.image})` }}
              />
              <div className="tp-trending-banner-content">
                <h3 className="tp-trending-banner-title">
                  <Link href={banner.href}>{banner.title}</Link>
                </h3>
                <div className="tp-trending-banner-btn">
                  <Link href={banner.href} className="tp-btn tp-btn-border tp-btn-border-white tp-btn-border-white-sm">
                    {banner.cta}
                    <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 7.5L1 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9.9502 1.47541L16.0002 7.49941L9.9502 13.5244" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </section>
  );
}

