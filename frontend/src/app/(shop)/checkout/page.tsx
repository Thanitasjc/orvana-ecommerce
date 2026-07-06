/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/shop/cart/CartProvider";
import { ShopVatSummary } from "@/components/shop/ShopVatSummary";
import { submitMemberCheckout } from "@/lib/api/checkout";
import { apiFetch } from "@/lib/api/client";
import { getCookie, MEMBER_TOKEN_KEY } from "@/lib/auth/cookies";
import { formatBaht } from "@/lib/pricing/vat";
import { calculateShopTotals } from "@/lib/shop/orderTotals";

type Member = {
  name: string;
  email: string;
  phone?: string | null;
};

const PAYMENT_OPTIONS = [
  { id: "bank_transfer", label: "โอนเงินผ่านธนาคาร", value: "โอนเงินผ่านธนาคาร" },
  { id: "cod", label: "เก็บเงินปลายทาง", value: "เก็บเงินปลายทาง" },
  { id: "card", label: "บัตรเครดิต / เดบิต", value: "บัตรเครดิต" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, setItems, appliedCoupon, removeCoupon } = useCart();
  const [member, setMember] = useState<Member | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_OPTIONS[2].value);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const totals = useMemo(
    () =>
      calculateShopTotals(
        subtotal,
        appliedCoupon?.discount ?? 0,
        undefined,
        appliedCoupon?.shipping_discount ?? 0,
      ),
    [subtotal, appliedCoupon?.discount, appliedCoupon?.shipping_discount],
  );

  useEffect(() => {
    const token = getCookie(MEMBER_TOKEN_KEY);
    if (!token) {
      setAuthChecked(true);
      return;
    }

    apiFetch<{ data: Member }>("/member/me", { token })
      .then((res) => setMember(res.data))
      .catch(() => setMember(null))
      .finally(() => setAuthChecked(true));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (items.length === 0) {
      setError("ตะกร้าว่าง — กรุณาเลือกสินค้าก่อน");
      return;
    }

    const token = getCookie(MEMBER_TOKEN_KEY);
    if (!token) {
      router.push("/login");
      return;
    }

    if (!agreed) {
      setError("กรุณายอมรับเงื่อนไขก่อนสั่งซื้อ");
      return;
    }

    setLoading(true);
    try {
      const res = await submitMemberCheckout(items, paymentMethod, token, appliedCoupon?.code);
      setItems([]);
      removeCoupon();
      setSuccess(`สั่งซื้อสำเร็จ — เลขที่ออเดอร์ ${res.data.order_number}`);
      window.setTimeout(() => router.push("/account"), 1800);
    } catch (err: unknown) {
      const message = (err as { message?: string }).message ?? "สั่งซื้อไม่สำเร็จ";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!authChecked) {
    return (
      <section className="tp-checkout-area pb-120 pt-50">
        <div className="container">
          <p className="text-center">กำลังโหลด...</p>
        </div>
      </section>
    );
  }

  return (
    <main>
      <section className="breadcrumb__area include-bg pt-95 pb-50">
        <div className="container">
          <div className="row">
            <div className="col-xxl-12">
              <div className="breadcrumb__content p-relative z-index-1">
                <h3 className="breadcrumb__title">Checkout</h3>
                <div className="breadcrumb__list">
                  <span>
                    <Link href="/">Home</Link>
                  </span>
                  <span>
                    <Link href="/cart">Cart</Link>
                  </span>
                  <span>Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tp-checkout-area pb-120" data-bg-color="#EFF1F5">
        <div className="container">
          {!member ? (
            <div className="tp-checkout-verify mb-40">
              <div className="tp-checkout-verify-item">
                <p className="tp-checkout-verify-reveal mb-0">
                  ต้องเข้าสู่ระบบสมาชิกก่อนสั่งซื้อ —{" "}
                  <Link href="/login">เข้าสู่ระบบ</Link> หรือ <Link href="/register">สมัครสมาชิก</Link>
                </p>
              </div>
            </div>
          ) : null}

          {items.length === 0 && !success ? (
            <div className="white-bg p-4 text-center">
              <p className="mb-20">ตะกร้าว่าง</p>
              <Link href="/shop" className="tp-btn">
                ไปเลือกสินค้า
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="row">
                <div className="col-lg-7">
                  <div className="tp-checkout-bill-area">
                    <h3 className="tp-checkout-bill-title">Billing Details</h3>
                    <div className="tp-checkout-bill-form">
                      <div className="tp-checkout-bill-inner">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="tp-checkout-input">
                              <label>
                                ชื่อ <span>*</span>
                              </label>
                              <input
                                type="text"
                                name="first_name"
                                placeholder="ชื่อ"
                                defaultValue={member?.name?.split(" ")[0] ?? ""}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="tp-checkout-input">
                              <label>
                                นามสกุล <span>*</span>
                              </label>
                              <input
                                type="text"
                                name="last_name"
                                placeholder="นามสกุล"
                                defaultValue={member?.name?.split(" ").slice(1).join(" ") ?? ""}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="tp-checkout-input">
                              <label>
                                อีเมล <span>*</span>
                              </label>
                              <input
                                type="email"
                                name="email"
                                placeholder="อีเมล"
                                defaultValue={member?.email ?? ""}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="tp-checkout-input">
                              <label>
                                เบอร์โทร <span>*</span>
                              </label>
                              <input
                                type="text"
                                name="phone"
                                placeholder="เบอร์โทร"
                                defaultValue={member?.phone ?? ""}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="tp-checkout-input">
                              <label>ที่อยู่จัดส่ง</label>
                              <input type="text" name="address" placeholder="บ้านเลขที่ ถนน แขวง/ตำบล" required />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="tp-checkout-input">
                              <label>จังหวัด</label>
                              <input type="text" name="province" placeholder="จังหวัด" required />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="tp-checkout-input">
                              <label>รหัสไปรษณีย์</label>
                              <input type="text" name="postcode" placeholder="รหัสไปรษณีย์" required />
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="tp-checkout-input">
                              <label>หมายเหตุ (ถ้ามี)</label>
                              <textarea name="notes" placeholder="หมายเหตุเพิ่มเติมสำหรับการจัดส่ง" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-5">
                  <div className="tp-checkout-place white-bg">
                    <h3 className="tp-checkout-place-title">Your Order</h3>

                    <div className="tp-order-info-list">
                      <ul>
                        <li className="tp-order-info-list-header">
                          <h4>Product</h4>
                          <h4>Total</h4>
                        </li>

                        {items.map((item) => (
                          <li className="tp-order-info-list-desc" key={item.id}>
                            <p>
                              {item.title} <span> x {item.quantity}</span>
                            </p>
                            <span>฿{(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}

                        <li className="tp-order-info-list-subtotal">
                          <span>Subtotal (รวม VAT)</span>
                          <span>฿{formatBaht(totals.subtotal)}</span>
                        </li>

                        {totals.discount > 0 ? (
                          <li className="tp-order-info-list-subtotal">
                            <span>ส่วนลด ({appliedCoupon?.code})</span>
                            <span className="text-success">−฿{formatBaht(totals.discount)}</span>
                          </li>
                        ) : null}

                        <li className="tp-order-info-list-shipping">
                          <span>Shipping</span>
                          <div className="tp-order-info-list-shipping-item d-flex flex-column align-items-end">
                            <span>
                              <input id="flat_rate" type="radio" name="shipping" checked={totals.shippingFee > 0} readOnly />
                              <label htmlFor="flat_rate">
                                Flat rate: <span>฿{formatBaht(totals.shippingFee)}</span>
                              </label>
                            </span>
                            <span>
                              <input id="free_shipping" type="radio" name="shipping" checked={totals.shippingFee === 0} readOnly />
                              <label htmlFor="free_shipping">Free shipping</label>
                            </span>
                          </div>
                        </li>

                        <ShopVatSummary totals={totals} variant="checkout" />

                        <li className="tp-order-info-list-total">
                          <span>Total (รวม VAT)</span>
                          <span>฿{formatBaht(totals.total)}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="tp-checkout-payment">
                      {PAYMENT_OPTIONS.map((option) => (
                        <div className="tp-checkout-payment-item" key={option.id}>
                          <input
                            id={option.id}
                            type="radio"
                            name="payment"
                            checked={paymentMethod === option.value}
                            onChange={() => setPaymentMethod(option.value)}
                          />
                          <label htmlFor={option.id}>{option.label}</label>
                        </div>
                      ))}
                    </div>

                    <div className="tp-checkout-agree">
                      <div className="tp-checkout-option">
                        <input
                          id="read_all"
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <label htmlFor="read_all">ฉันได้อ่านและยอมรับเงื่อนไขการสั่งซื้อ</label>
                      </div>
                    </div>

                    {error ? <p className="text-danger mt-20 mb-0">{error}</p> : null}
                    {success ? <p className="text-success mt-20 mb-0">{success}</p> : null}

                    <div className="tp-checkout-btn-wrapper">
                      <button type="submit" className="tp-checkout-btn w-100" disabled={loading || !member}>
                        {loading ? "กำลังสั่งซื้อ..." : "Place Order"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
