/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/shop/cart/CartProvider";
import { ShopVatSummary } from "@/components/shop/ShopVatSummary";
import { submitGuestCheckout, submitMemberCheckout } from "@/lib/api/checkout";
import { apiFetch } from "@/lib/api/client";
import { getCookie, MEMBER_TOKEN_KEY } from "@/lib/auth/cookies";
import { fetchLoyaltySettings } from "@/lib/loyalty/api";
import { calcEarnPoints, calcLoyaltyCheckout } from "@/lib/loyalty/calc";
import type { LoyaltySettings } from "@/lib/loyalty/types";
import { DEFAULT_LOYALTY_SETTINGS } from "@/lib/loyalty/types";
import { formatBaht } from "@/lib/pricing/vat";
import { calculateShopTotals } from "@/lib/shop/orderTotals";
import { formatShippingMethodLabel } from "@/lib/shipping/api";

type Member = {
  name: string;
  email: string;
  phone?: string | null;
  points: number;
};

type CheckoutMode = "guest" | "member";

const PAYMENT_OPTIONS = [
  { id: "bank_transfer", label: "โอนเงินผ่านธนาคาร", value: "โอนเงินผ่านธนาคาร" },
  { id: "cod", label: "เก็บเงินปลายทาง", value: "เก็บเงินปลายทาง" },
  { id: "card", label: "บัตรเครดิต / เดบิต", value: "บัตรเครดิต" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, setItems, appliedCoupon, removeCoupon, shippingMethods, shippingLoading, selectedShippingMethodId, setSelectedShippingMethodId, shippingFee } = useCart();
  const [member, setMember] = useState<Member | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("guest");
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_OPTIONS[2].value);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>(DEFAULT_LOYALTY_SETTINGS);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const isMemberCheckout = checkoutMode === "member" && !!member;
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const loyaltyCheckout = calcLoyaltyCheckout(
    subtotal,
    couponDiscount,
    isMemberCheckout ? pointsToRedeem : 0,
    member?.points ?? 0,
    loyaltySettings,
  );

  const totals = useMemo(
    () =>
      calculateShopTotals(
        subtotal,
        couponDiscount + (isMemberCheckout ? loyaltyCheckout.pointsDiscount : 0),
        shippingFee,
        appliedCoupon?.shipping_discount ?? 0,
      ),
    [subtotal, couponDiscount, isMemberCheckout, loyaltyCheckout.pointsDiscount, appliedCoupon?.shipping_discount, shippingFee],
  );

  useEffect(() => {
    fetchLoyaltySettings()
      .then((res) => setLoyaltySettings(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const token = getCookie(MEMBER_TOKEN_KEY);
    if (!token) {
      setAuthChecked(true);
      return;
    }

    apiFetch<{ data: Member }>("/member/me", { token })
      .then((res) => {
        setMember(res.data);
        setCheckoutMode("member");
      })
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

    if (!agreed) {
      setError("กรุณายอมรับเงื่อนไขก่อนสั่งซื้อ");
      return;
    }

    if (!selectedShippingMethodId) {
      setError("กรุณาเลือกวิธีจัดส่ง");
      return;
    }

    if (checkoutMode === "member" && !member) {
      setError("กรุณาเข้าสู่ระบบสมาชิก หรือเลือกชำระแบบไม่สมัคร");
      return;
    }

    const form = new FormData(e.currentTarget);

    setLoading(true);
    try {
      if (checkoutMode === "member" && member) {
        const token = getCookie(MEMBER_TOKEN_KEY);
        if (!token) {
          router.push("/login?redirect=/checkout");
          return;
        }

        const res = await submitMemberCheckout(
          items,
          paymentMethod,
          token,
          selectedShippingMethodId,
          appliedCoupon?.code,
          loyaltyCheckout.pointsUsed,
        );
        setItems([]);
        removeCoupon();
        setSuccess(`สั่งซื้อสำเร็จ — เลขที่ออเดอร์ ${res.data.order_number}`);
        window.setTimeout(() => router.push("/account"), 1800);
        return;
      }

      const res = await submitGuestCheckout(
        items,
        paymentMethod,
        {
          first_name: String(form.get("first_name") ?? "").trim(),
          last_name: String(form.get("last_name") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
          phone: String(form.get("phone") ?? "").trim(),
          address: String(form.get("address") ?? "").trim(),
          province: String(form.get("province") ?? "").trim(),
          postcode: String(form.get("postcode") ?? "").trim(),
          notes: String(form.get("notes") ?? "").trim() || undefined,
        },
        selectedShippingMethodId,
        appliedCoupon?.code,
      );
      setItems([]);
      removeCoupon();
      setSuccess(
        `สั่งซื้อสำเร็จ — เลขที่ออเดอร์ ${res.data.order_number} เราส่งอีเมลยืนยันให้แล้ว`,
      );
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> };
      const message =
        apiErr.errors?.points_to_redeem?.[0] ??
        apiErr.errors?.shipping_method_id?.[0] ??
        apiErr.errors?.coupon_code?.[0] ??
        apiErr.errors?.stock?.[0] ??
        apiErr.message ??
        "สั่งซื้อไม่สำเร็จ";
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
          {!success ? (
            <div className="mb-40 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCheckoutMode("guest")}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  checkoutMode === "guest"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                ชำระแบบไม่สมัคร
              </button>
              <button
                type="button"
                onClick={() => setCheckoutMode("member")}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  checkoutMode === "member"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                สมาชิก {member ? `(${member.name})` : "— เข้าสู่ระบบ"}
              </button>
            </div>
          ) : null}

          {checkoutMode === "member" && !member && !success ? (
            <div className="tp-checkout-verify mb-40">
              <div className="tp-checkout-verify-item">
                <p className="tp-checkout-verify-reveal mb-0">
                  เข้าสู่ระบบเพื่อสะสมแต้มและดูประวัติออเดอร์ —{" "}
                  <Link href="/login?redirect=/checkout">เข้าสู่ระบบ</Link> หรือ{" "}
                  <Link href="/register">สมัครสมาชิก</Link>
                  {" · "}
                  <button
                    type="button"
                    className="font-bold text-emerald-700 underline"
                    onClick={() => setCheckoutMode("guest")}
                  >
                    ชำระแบบไม่สมัคร
                  </button>
                </p>
              </div>
            </div>
          ) : null}

          {checkoutMode === "guest" && !success ? (
            <div className="mb-40 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              สั่งซื้อได้โดยไม่ต้องสมัคร — กรอกข้อมูลจัดส่งด้านล่าง
              {loyaltySettings.enabled ? " (สะสมแต้มเมื่อสมัครสมาชิกภายหลัง)" : null}
            </div>
          ) : null}

          {items.length === 0 && !success ? (
            <div className="white-bg p-4 text-center">
              <p className="mb-20">ตะกร้าว่าง</p>
              <Link href="/shop" className="tp-btn">
                ไปเลือกสินค้า
              </Link>
            </div>
          ) : success ? (
            <div className="white-bg p-5 text-center">
              <p className="mb-3 text-success">{success}</p>
              {checkoutMode === "guest" ? (
                <p className="mb-4 text-sm text-slate-600">
                  <Link href="/register" className="font-bold text-emerald-700 underline">
                    สมัครสมาชิก
                  </Link>{" "}
                  เพื่อสะสมแต้มในออเดอร์ถัดไป
                </p>
              ) : null}
              <Link href="/shop" className="tp-btn">
                กลับไปเลือกสินค้า
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="row">
                <div className="col-lg-7">
                  <div className="tp-checkout-bill-area">
                    <h3 className="tp-checkout-bill-title">
                      {checkoutMode === "guest" ? "ข้อมูลจัดส่ง" : "Billing Details"}
                    </h3>
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
                                readOnly={checkoutMode === "member" && !!member}
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
                                readOnly={checkoutMode === "member" && !!member}
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
                                readOnly={checkoutMode === "member" && !!member}
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
                                readOnly={checkoutMode === "member" && !!member}
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

                        {isMemberCheckout && loyaltyCheckout.pointsDiscount > 0 ? (
                          <li className="tp-order-info-list-subtotal">
                            <span>ส่วนลดแต้ม ({loyaltyCheckout.pointsUsed} แต้ม)</span>
                            <span className="text-success">−฿{formatBaht(loyaltyCheckout.pointsDiscount)}</span>
                          </li>
                        ) : null}

                        {isMemberCheckout && loyaltySettings.redeem_enabled ? (
                          <li className="tp-order-info-list-subtotal">
                            <span>ใช้แต้ม (คงเหลือ {member?.points ?? 0})</span>
                            <input
                              type="number"
                              min={0}
                              step={loyaltySettings.redeem_points_per_baht}
                              max={member?.points ?? 0}
                              value={pointsToRedeem || ""}
                              onChange={(event) => setPointsToRedeem(Number(event.target.value) || 0)}
                              className="form-control form-control-sm text-end"
                              style={{ maxWidth: 120 }}
                              placeholder="0"
                            />
                          </li>
                        ) : null}

                        {isMemberCheckout && loyaltySettings.enabled ? (
                          <li className="tp-order-info-list-subtotal">
                            <span>แต้มที่จะได้รับ</span>
                            <span>+{calcEarnPoints(totals.total, loyaltySettings)} แต้ม</span>
                          </li>
                        ) : null}

                        <li className="tp-order-info-list-shipping">
                          <span>Shipping</span>
                          <div className="tp-order-info-list-shipping-item d-flex flex-column align-items-end">
                            {shippingLoading ? (
                              <span className="text-sm text-slate-500">กำลังโหลด...</span>
                            ) : shippingMethods.length === 0 ? (
                              <span className="text-sm text-danger">ไม่มีวิธีจัดส่ง</span>
                            ) : (
                              shippingMethods.map((method) => (
                                <span key={method.id}>
                                  <input
                                    id={`checkout_shipping_${method.id}`}
                                    type="radio"
                                    name="shipping"
                                    checked={selectedShippingMethodId === method.id}
                                    onChange={() => setSelectedShippingMethodId(method.id)}
                                  />
                                  <label htmlFor={`checkout_shipping_${method.id}`}>
                                    {formatShippingMethodLabel(method)}
                                  </label>
                                </span>
                              ))
                            )}
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

                    <div className="tp-checkout-btn-wrapper">
                      <button
                        type="submit"
                        className="tp-checkout-btn w-100"
                        disabled={loading || (checkoutMode === "member" && !member) || !selectedShippingMethodId}
                      >
                        {loading
                          ? "กำลังสั่งซื้อ..."
                          : checkoutMode === "guest"
                            ? "สั่งซื้อ (ไม่สมัครสมาชิก)"
                            : "Place Order"}
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
