/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/components/shop/cart/CartProvider";
import { ShopVatSummary } from "@/components/shop/ShopVatSummary";
import { calculateShopTotals } from "@/lib/shop/orderTotals";
import { formatBaht } from "@/lib/pricing/vat";

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();
  const totals = useMemo(() => calculateShopTotals(subtotal), [subtotal]);

  return (
    <main>
      <section className="breadcrumb__area include-bg pt-95 pb-50">
        <div className="container">
          <div className="row">
            <div className="col-xxl-12">
              <div className="breadcrumb__content p-relative z-index-1">
                <h3 className="breadcrumb__title">Shopping Cart</h3>
                <div className="breadcrumb__list">
                  <span>
                    <Link href="/">Home</Link>
                  </span>
                  <span>Shopping Cart</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tp-cart-area pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-9 col-lg-8">
              <div className="tp-cart-list mb-25 mr-30">
                <table className="table">
                  <thead>
                    <tr>
                      <th colSpan={2} className="tp-cart-header-product">
                        Product
                      </th>
                      <th className="tp-cart-header-price">Price</th>
                      <th className="tp-cart-header-quantity">Quantity</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-5">
                          Your cart is empty. <Link href="/shop">Go to Shop</Link>
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
                            <span>${item.price.toFixed(2)}</span>
                          </td>
                          <td className="tp-cart-quantity">
                            <div className="tp-product-quantity mt-10 mb-10">
                              <button
                                type="button"
                                className="tp-cart-minus"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label={`Decrease quantity for ${item.title}`}
                              >
                                -
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
                                +
                              </button>
                            </div>
                          </td>
                          <td className="tp-cart-action">
                            <button className="tp-cart-action-btn" type="button" onClick={() => removeItem(item.id)}>
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="tp-cart-bottom">
                <div className="row align-items-end">
                  <div className="col-xl-6 col-md-8">
                    <div className="tp-cart-coupon">
                      <form>
                        <div className="tp-cart-coupon-input-box">
                          <label>Coupon Code:</label>
                          <div className="tp-cart-coupon-input d-flex align-items-center">
                            <input type="text" placeholder="Enter Coupon Code" />
                            <button type="submit">Apply</button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="col-xl-6 col-md-4">
                    <div className="tp-cart-update text-md-end">
                      <button type="button" className="tp-cart-update-btn">
                        Update Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-4 col-md-6">
              <div className="tp-cart-checkout-wrapper">
                <div className="tp-cart-checkout-top d-flex align-items-center justify-content-between">
                  <span className="tp-cart-checkout-top-title">Subtotal (รวม VAT)</span>
                  <span className="tp-cart-checkout-top-price">฿{formatBaht(totals.subtotal)}</span>
                </div>
                <div className="tp-cart-checkout-shipping">
                  <h4 className="tp-cart-checkout-shipping-title">Shipping</h4>
                  <div className="tp-cart-checkout-shipping-option-wrapper">
                    <div className="tp-cart-checkout-shipping-option">
                      <input id="flat_rate" type="radio" name="shipping" checked={totals.shippingFee > 0} readOnly />
                      <label htmlFor="flat_rate">
                        Flat rate: <span>฿{formatBaht(totals.shippingFee)}</span>
                      </label>
                    </div>
                    <div className="tp-cart-checkout-shipping-option">
                      <input id="free_shipping" type="radio" name="shipping" checked={totals.shippingFee === 0} readOnly />
                      <label htmlFor="free_shipping">Free shipping</label>
                    </div>
                  </div>
                </div>
                <ShopVatSummary totals={totals} variant="cart" />
                <div className="tp-cart-checkout-total d-flex align-items-center justify-content-between">
                  <span>Total (รวม VAT)</span>
                  <span>฿{formatBaht(totals.total)}</span>
                </div>
                <div className="tp-cart-checkout-proceed">
                  <Link href="/checkout" className="tp-cart-checkout-btn w-100">
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
