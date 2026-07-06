"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CouponCard } from "@/components/shop/coupon/CouponCard";
import { fetchPublicCoupons, type PublicCoupon } from "@/lib/api/coupons";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicCoupons()
      .then((response) => setCoupons(response.data ?? []))
      .catch(() => setError("โหลดคูปองไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="breadcrumb__area include-bg pt-95 pb-50">
        <div className="container">
          <div className="row">
            <div className="col-xxl-12">
              <div className="breadcrumb__content p-relative z-index-1">
                <h3 className="breadcrumb__title">Grab Best Offer</h3>
                <div className="breadcrumb__list">
                  <span>
                    <Link href="/">Home</Link>
                  </span>
                  <span>Coupon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="tp-coupon-area pb-120">
        <div className="container">
          {loading ? (
            <p className="text-center py-5">กำลังโหลดคูปอง...</p>
          ) : null}
          {error ? <p className="text-center text-danger py-5">{error}</p> : null}

          {!loading && !error && coupons.length === 0 ? (
            <p className="text-center py-5">
              ยังไม่มีคูปอง — <Link href="/shop">ไปช้อปปิ้ง</Link>
            </p>
          ) : null}

          {!loading && !error && coupons.length > 0 ? (
            <div className="row">
              {coupons.map((coupon, index) => (
                <CouponCard key={coupon.code} coupon={coupon} imageIndex={index} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
