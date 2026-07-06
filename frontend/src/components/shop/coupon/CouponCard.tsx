"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/shop/cart/CartProvider";
import { CouponCountdown } from "@/components/shop/coupon/CouponCountdown";
import type { PublicCoupon } from "@/lib/api/coupons";

import { formatCouponSummary } from "@/lib/coupons/constants";

const COUPON_IMAGES = [
  "/assets/img/product/2/prodcut-1.jpg",
  "/assets/img/product/2/prodcut-2.jpg",
  "/assets/img/product/2/prodcut-3.jpg",
  "/assets/img/product/2/prodcut-4.jpg",
  "/assets/img/product/2/prodcut-5.jpg",
  "/assets/img/product/2/prodcut-6.jpg",
];

const channelLabels: Record<PublicCoupon["channel"], string> = {
  both: "ออนไลน์ + หน้าร้าน",
  online: "ออนไลน์เท่านั้น",
  pos: "หน้าร้าน (POS) เท่านั้น",
};

function isCouponUsable(coupon: PublicCoupon) {
  if (!coupon.is_active) return false;

  const now = Date.now();
  if (coupon.starts_at && now < new Date(coupon.starts_at).getTime()) return false;
  if (coupon.ends_at && now > new Date(coupon.ends_at).getTime()) return false;
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) return false;

  return true;
}

function formatOffer(coupon: PublicCoupon) {
  return formatCouponSummary(coupon).replace("Off", "").trim();
}

type CouponCardProps = {
  coupon: PublicCoupon;
  imageIndex: number;
};

export function CouponCard({ coupon, imageIndex }: CouponCardProps) {
  const router = useRouter();
  const { applyCoupon } = useCart();
  const [copied, setCopied] = useState(false);
  const usable = isCouponUsable(coupon);
  const imageSrc = COUPON_IMAGES[imageIndex % COUPON_IMAGES.length];

  async function handleUseCoupon() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable.
    }

    if (usable && coupon.channel !== "pos") {
      await applyCoupon(coupon.code);
      router.push("/cart");
    }
  }

  const minOrderText =
    coupon.min_order > 0 ? `฿${coupon.min_order.toLocaleString("th-TH")}` : "ไม่มีขั้นต่ำ";

  return (
    <div className="col-xl-6">
      <div className="tp-coupon-item mb-30 p-relative d-md-flex justify-content-between align-items-center">
        <span className="tp-coupon-border" />
        <div className="tp-coupon-item-left d-sm-flex align-items-center">
          <div className="tp-coupon-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={coupon.name} src={imageSrc} />
          </div>
          <div className="tp-coupon-content">
            <h3 className="tp-coupon-title">{coupon.name}</h3>
            <p className="tp-coupon-offer mb-15">
              <span>{formatOffer(coupon)}</span> Off
            </p>
            {coupon.ends_at && usable ? <CouponCountdown endsAt={coupon.ends_at} /> : null}
            {!usable && coupon.ends_at && new Date(coupon.ends_at).getTime() < Date.now() ? (
              <p className="mb-0 text-danger">หมดอายุแล้ว</p>
            ) : null}
            {!usable && !coupon.is_active ? <p className="mb-0 text-muted">ปิดใช้งานชั่วคราว</p> : null}
          </div>
        </div>
        <div className="tp-coupon-item-right pl-20">
          <div className="tp-coupon-status mb-10 d-flex align-items-center">
            <h4>
              Coupon <span className={usable ? "active" : ""}>{usable ? "Active" : "Inactive"}</span>
            </h4>
            <div className="tp-coupon-info-details">
              <span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9 1.5C4.99594 1.5 1.75 4.74594 1.75 8.75C1.75 12.7541 4.99594 16 9 16C13.0041 16 16.25 12.7541 16.25 8.75C16.25 4.74594 13.0041 1.5 9 1.5ZM0.25 8.75C0.25 3.91751 4.16751 0 9 0C13.8325 0 17.75 3.91751 17.75 8.75C17.75 13.5825 13.8325 17.5 9 17.5C4.16751 17.5 0.25 13.5825 0.25 8.75ZM9 7.75C9.55229 7.75 10 8.19771 10 8.75V11.95C10 12.5023 9.55229 12.95 9 12.95C8.44771 12.95 8 12.5023 8 11.95V8.75C8 8.19771 8.44771 7.75 9 7.75ZM9 4.5498C8.44771 4.5498 8 4.99752 8 5.5498C8 6.10209 8.44771 6.5498 9 6.5498H9.008C9.56028 6.5498 10.008 6.10209 10.008 5.5498C10.008 4.99752 9.56028 4.5498 9.008 4.5498H9Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <div className="tp-coupon-info-tooltip transition-3">
                <p>
                  *ใช้ได้ช่องทาง <span>{channelLabels[coupon.channel]}</span> เมื่อสั่งซื้อขั้นต่ำ{" "}
                  <span>{minOrderText}</span>
                  {coupon.max_uses ? (
                    <>
                      {" "}
                      (เหลือ {Math.max(0, coupon.max_uses - coupon.used_count)} สิทธิ์)
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </div>
          <div className="tp-coupon-date">
            <button type="button" onClick={() => void handleUseCoupon()} disabled={!usable}>
              <span>{copied ? "คัดลอกแล้ว!" : coupon.code}</span>
            </button>
          </div>
          {coupon.channel === "pos" && usable ? (
            <p className="mt-2 mb-0" style={{ fontSize: "12px", color: "#77808d" }}>
              ใช้ที่หน้าร้าน POS
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
