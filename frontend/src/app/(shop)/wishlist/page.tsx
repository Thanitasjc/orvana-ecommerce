/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useCart } from "@/components/shop/cart/CartProvider";
import { useWishlist } from "@/components/shop/wishlist/WishlistProvider";
import { formatPriceTHB } from "@/lib/api/products";

export default function WishlistPage() {
  const { items, removeItem, updateQuantity } = useWishlist();
  const { addItem } = useCart();

  return (
    <main>
      <section className="breadcrumb__area include-bg pt-95 pb-50">
        <div className="container">
          <div className="row">
            <div className="col-xxl-12">
              <div className="breadcrumb__content p-relative z-index-1">
                <h3 className="breadcrumb__title">Wishlist</h3>
                <div className="breadcrumb__list">
                  <span>
                    <Link href="/">Home</Link>
                  </span>
                  <span>Wishlist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tp-cart-area pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-cart-list mb-45 mr-30">
                <table className="table">
                  <thead>
                    <tr>
                      <th colSpan={2} className="tp-cart-header-product">
                        Product
                      </th>
                      <th className="tp-cart-header-price">Price</th>
                      <th className="tp-cart-header-quantity">Quantity</th>
                      <th>Action</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          ยังไม่มีสินค้าใน Wishlist — <Link href="/shop">ไปเลือกสินค้า</Link>
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id}>
                          <td className="tp-cart-img">
                            <Link href={item.href}>
                              <img src={item.image} alt={item.title} />
                            </Link>
                          </td>
                          <td className="tp-cart-title">
                            <Link href={item.href}>{item.title}</Link>
                          </td>
                          <td className="tp-cart-price">
                            <span>{formatPriceTHB(item.price)}</span>
                          </td>
                          <td className="tp-cart-quantity">
                            <div className="tp-product-quantity mt-10 mb-10">
                              <button
                                type="button"
                                className="tp-cart-minus"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label={`Decrease quantity for ${item.title}`}
                              >
                                <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 1H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              <input
                                className="tp-cart-input"
                                type="text"
                                value={item.quantity}
                                readOnly
                                aria-label={`Quantity for ${item.title}`}
                              />
                              <button
                                type="button"
                                className="tp-cart-plus"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label={`Increase quantity for ${item.title}`}
                              >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="tp-cart-add-to-cart">
                            <button
                              type="button"
                              className="tp-btn tp-btn-2 tp-btn-blue"
                              onClick={() =>
                                addItem({
                                  id: item.id,
                                  title: item.title,
                                  href: item.href,
                                  image: item.image,
                                  price: item.price,
                                  quantity: item.quantity,
                                })
                              }
                            >
                              Add To Cart
                            </button>
                          </td>
                          <td className="tp-cart-action">
                            <button
                              type="button"
                              className="tp-cart-action-btn"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.title}`}
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M9.53033 1.53033C9.82322 1.23744 9.82322 0.762563 9.53033 0.46967C9.23744 0.176777 8.76256 0.176777 8.46967 0.46967L5 3.93934L1.53033 0.46967C1.23744 0.176777 0.762563 0.176777 0.46967 0.46967C0.176777 0.762563 0.176777 1.23744 0.46967 1.53033L3.93934 5L0.46967 8.46967C0.176777 8.76256 0.176777 9.23744 0.46967 9.53033C0.762563 9.82322 1.23744 9.82322 1.53033 9.53033L5 6.06066L8.46967 9.53033C8.76256 9.82322 9.23744 9.82322 9.53033 9.53033C9.82322 9.23744 9.82322 8.76256 9.53033 8.46967L6.06066 5L9.53033 1.53033Z"
                                  fill="currentColor"
                                />
                              </svg>
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {items.length > 0 ? (
                <div className="tp-cart-bottom">
                  <div className="row align-items-end">
                    <div className="col-xl-6 col-md-4">
                      <div className="tp-cart-update">
                        <Link href="/cart" className="tp-cart-update-btn">
                          Go To Cart
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
