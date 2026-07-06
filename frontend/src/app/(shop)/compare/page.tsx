/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useCompare } from "@/components/shop/compare/CompareProvider";
import { useCart } from "@/components/shop/cart/CartProvider";
import { formatPriceTHB } from "@/lib/api/products";

function stripHtml(value?: string) {
  if (!value) return "-";
  const text = value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text || "-";
}

function CompareStars({ rating = 5 }: { rating?: number }) {
  const stars = Math.max(1, Math.min(5, Math.round(rating)));
  return (
    <div className="tp-compare-rating">
      {Array.from({ length: stars }).map((_, index) => (
        <span key={index}>
          <i className="fas fa-star" />
        </span>
      ))}
    </div>
  );
}

export default function ComparePage() {
  const { items, removeItem, clearItems } = useCompare();
  const { addItem } = useCart();

  return (
    <main>
      <section className="breadcrumb__area include-bg pt-95 pb-50">
        <div className="container">
          <div className="row">
            <div className="col-xxl-12">
              <div className="breadcrumb__content p-relative z-index-1">
                <h3 className="breadcrumb__title">Compare</h3>
                <div className="breadcrumb__list">
                  <span>
                    <Link href="/">Home</Link>
                  </span>
                  <span>Compare</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tp-compare-area pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              {items.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mb-20">ยังไม่มีสินค้าในรายการเปรียบเทียบ</p>
                  <Link href="/shop" className="tp-btn">
                    ไปเลือกสินค้า
                  </Link>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-end mb-20">
                    <button type="button" className="tp-btn-border" onClick={clearItems}>
                      ล้างทั้งหมด
                    </button>
                  </div>
                  <div className="tp-compare-table table-responsive text-center">
                    <table className="table">
                      <tbody>
                        <tr>
                          <th>Product</th>
                          {items.map((item) => (
                            <td key={`product-${item.id}`}>
                              <div className="tp-compare-thumb">
                                <img src={item.image} alt={item.title} />
                                <h4 className="tp-compare-product-title">
                                  <Link href={item.href}>{item.title}</Link>
                                </h4>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th>Description</th>
                          {items.map((item) => (
                            <td key={`desc-${item.id}`}>
                              <div className="tp-compare-desc">
                                <p>{stripHtml(item.description)}</p>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th>Price</th>
                          {items.map((item) => (
                            <td key={`price-${item.id}`}>
                              <div className="tp-compare-price">
                                <span>{formatPriceTHB(item.price)}</span>
                                {item.oldPrice ? (
                                  <span className="old-price">{formatPriceTHB(item.oldPrice)}</span>
                                ) : null}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th>Add to cart</th>
                          {items.map((item) => (
                            <td key={`cart-${item.id}`}>
                              <div className="tp-compare-add-to-cart">
                                <button
                                  type="button"
                                  className="tp-btn"
                                  onClick={() =>
                                    addItem({
                                      id: item.id,
                                      title: item.title,
                                      href: item.href,
                                      image: item.image,
                                      price: item.price,
                                      quantity: 1,
                                    })
                                  }
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th>Rating</th>
                          {items.map((item) => (
                            <td key={`rating-${item.id}`}>
                              <CompareStars rating={item.rating} />
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th>Remove</th>
                          {items.map((item) => (
                            <td key={`remove-${item.id}`}>
                              <div className="tp-compare-remove">
                                <button type="button" aria-label={`Remove ${item.title}`} onClick={() => removeItem(item.id)}>
                                  <i className="fal fa-trash-alt" />
                                </button>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
