"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/shop/cart/CartProvider";
import { parseDisplayPrice, useCompare } from "@/components/shop/compare/CompareProvider";
import { useWishlist } from "@/components/shop/wishlist/WishlistProvider";
import { QuickViewModal, type QuickViewProduct } from "@/components/shop/home/QuickViewModal";

type SellerItem = {
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

type BestSellerSectionProps = {
  items?: SellerItem[];
  shopHref?: string;
};

const defaultItems: SellerItem[] = [
  {
    id: "s-1",
    image: "/assets/img/product/2/prodcut-9.jpg",
    title: "Govicta Men's Shoes Leather",
    href: "/products/best-seller-1",
    tags: ["Shoes", "Work Dress"],
    price: "$76.00",
    oldPrice: "$120.00",
  },
  {
    id: "s-2",
    image: "/assets/img/product/2/prodcut-10.jpg",
    title: "Backpack, School, Travel",
    href: "/products/best-seller-2",
    tags: ["Backpack", "School Bag"],
    price: "$82.00",
    oldPrice: "$99.00",
  },
  {
    id: "s-3",
    image: "/assets/img/product/2/prodcut-11.jpg",
    title: "Legendary Whitetails Men's.",
    href: "/products/best-seller-3",
    tags: ["Shoe", "Men's"],
    price: "$36.00",
    oldPrice: "$72.00",
  },
  {
    id: "s-4",
    image: "/assets/img/product/2/prodcut-12.jpg",
    title: "Tommy Hilfiger Women’s Jaden",
    href: "/products/best-seller-4",
    tags: ["Bag", "Wonder"],
    price: "$44.00",
    oldPrice: "$66.00",
  },
];

const actionBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

const actionIconStyle = {
  display: "block",
} as const;

export function BestSellerSection({ items = defaultItems, shopHref = "/shop" }: BestSellerSectionProps) {
  const { addItem } = useCart();
  const { addItem: addCompareItem } = useCompare();
  const { addItem: addWishlistItem } = useWishlist();
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);
  const parsePrice = (value: string) => parseDisplayPrice(value);
  const makeCartId = (value: string) =>
    Math.abs(
      Array.from(value).reduce((acc, ch) => {
        return (acc * 31 + ch.charCodeAt(0)) % 2147483647;
      }, 7),
    );

  return (
    <section className="tp-seller-area pb-140">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 mb-50">
              <span className="tp-section-title-pre-2">
                Best Seller This Week&apos;s
                <svg width="82" height="22" viewBox="0 0 82 22" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <h3 className="tp-section-title-2">This Week&apos;s Featured</h3>
            </div>
          </div>
        </div>

        <div className="row">
          {items.map((item) => (
            <div className="col-xl-3 col-lg-4 col-sm-6" key={item.id}>
              <div className="tp-product-item-2 mb-40">
                <div className="tp-product-thumb-2 p-relative z-index-1 fix w-img">
                  <Link href={item.href}>
                    <img src={item.image} alt={item.title} />
                  </Link>
                  <div className="tp-product-action-2 tp-product-action-blackStyle">
                    <div className="tp-product-action-item-2 d-flex flex-column">
                      <button
                        type="button"
                        className="tp-product-action-btn-2 tp-product-add-cart-btn"
                        style={actionBtnStyle}
                        onClick={() =>
                          addItem({
                            id: item.productId ?? makeCartId(`seller-${item.id}`),
                            title: item.title,
                            href: item.href,
                            image: item.image,
                            price: item.priceValue ?? parsePrice(item.price),
                            quantity: 1,
                          })
                        }
                      >
                        <svg style={actionIconStyle} width="17" height="17" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.48626 20.5H14.8341C17.9004 20.5 20.2528 19.3924 19.5847 14.9348L18.8066 8.89359C18.3947 6.66934 16.976 5.81808 15.7311 5.81808H5.55262C4.28946 5.81808 2.95308 6.73341 2.4771 8.89359L1.69907 14.9348C1.13157 18.889 3.4199 20.5 6.48626 20.5Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6.34902 5.5984C6.34902 3.21232 8.28331 1.27803 10.6694 1.27803V1.27803C11.8184 1.27316 12.922 1.72619 13.7362 2.53695C14.5504 3.3477 15.0081 4.44939 15.0081 5.5984V5.5984"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.70365 10.1018H7.74942"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.5343 10.1018H13.5801"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="tp-product-tooltip tp-product-tooltip-right">Add to Cart</span>
                      </button>
                      <button
                        type="button"
                        className="tp-product-action-btn-2 tp-product-quick-view-btn"
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
                          <path
                            d="M1 7.3C2.7 3.9 5.5 1.8 9 1.8C12.5 1.8 15.3 3.9 17 7.3C15.3 10.7 12.5 12.8 9 12.8C5.5 12.8 2.7 10.7 1 7.3Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 9.2C10.1 9.2 11 8.3 11 7.2C11 6.1 10.1 5.2 9 5.2C7.9 5.2 7 6.1 7 7.2C7 8.3 7.9 9.2 9 9.2Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="tp-product-tooltip tp-product-tooltip-right">Quick View</span>
                      </button>
                      <button
                        type="button"
                        className="tp-product-action-btn-2 tp-product-add-to-wishlist-btn"
                        style={actionBtnStyle}
                        onClick={() =>
                          addWishlistItem({
                            id: item.productId ?? makeCartId(`best-${item.id}`),
                            title: item.title,
                            href: item.href,
                            image: item.image,
                            price: item.priceValue ?? parsePrice(item.price),
                          })
                        }
                      >
                        <svg style={actionIconStyle} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M9 15.6L7.7 14.4C3.4 10.5 1 8.3 1 5.6C1 3.4 2.8 1.6 5 1.6C6.3 1.6 7.6 2.2 8.4 3.2C9.2 2.2 10.5 1.6 11.8 1.6C14 1.6 15.8 3.4 15.8 5.6C15.8 8.3 13.4 10.5 9.1 14.4L9 15.6Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="tp-product-tooltip tp-product-tooltip-right">Add To Wishlist</span>
                      </button>
                      <button
                        type="button"
                        className="tp-product-action-btn-2 tp-product-add-to-compare-btn"
                        style={actionBtnStyle}
                        onClick={() =>
                          addCompareItem({
                            id: item.productId ?? makeCartId(`best-${item.id}`),
                            title: item.title,
                            href: item.href,
                            image: item.image,
                            price: item.priceValue ?? parsePrice(item.price),
                            oldPrice: item.oldPrice ? parsePrice(item.oldPrice) : undefined,
                          })
                        }
                      >
                        <svg style={actionIconStyle} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M11.4144 6.16828L14 3.58412L11.4144 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M1.48883 3.58374L14 3.58374"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4.07446 8.32153L1.48884 10.9057L4.07446 13.4898"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 10.9058H1.48883"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="tp-product-tooltip tp-product-tooltip-right">Add To Compare</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="tp-product-content-2 pt-15">
                  <div className="tp-product-tag-2">
                    {item.tags.map((tag) => (
                      <Link href={shopHref} key={`${item.id}-${tag}`}>
                        {tag}
                      </Link>
                    ))}
                  </div>
                  <h3 className="tp-product-title-2">
                    <Link href={item.href}>{item.title}</Link>
                  </h3>
                  <div className="tp-product-rating-icon tp-product-rating-icon-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={`${item.id}-star-${i}`}>
                        <i className="fa-solid fa-star" />
                      </span>
                    ))}
                  </div>
                  <div className="tp-product-price-wrapper-2">
                    <span className="tp-product-price-2 new-price">{item.price}</span>
                    {item.oldPrice ? <span className="tp-product-price-2 old-price">{item.oldPrice}</span> : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="tp-seller-more text-center mt-10">
              <Link href={shopHref} className="tp-btn tp-btn-border tp-btn-border-sm">
                Shop All Product
              </Link>
            </div>
          </div>
        </div>
      </div>
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </section>
  );
}

