"use client";

import type { AdminCoupon } from "@/lib/api/adminCoupons";

type AdminCouponQrModalProps = {
  open: boolean;
  coupon: AdminCoupon | null;
  qrUrl: string | null;
  barcodeUrl: string | null;
  loading: boolean;
  onClose: () => void;
};

export function AdminCouponQrModal({
  open,
  coupon,
  qrUrl,
  barcodeUrl,
  loading,
  onClose,
}: AdminCouponQrModalProps) {
  if (!open || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">QR / Barcode</h3>
            <p className="font-mono text-sm text-blue-300">{coupon.code}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ปิด
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-400">กำลังโหลด...</p> : null}

        {!loading && qrUrl ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-white p-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt={`QR ${coupon.code}`} className="mx-auto h-48 w-48" />
              <p className="mt-2 text-xs text-slate-600">QR Code สำหรับ POS / หน้าร้าน</p>
            </div>
            {barcodeUrl ? (
              <div className="rounded-xl border border-slate-800 bg-white p-4 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={barcodeUrl} alt={`Barcode ${coupon.code}`} className="mx-auto max-w-full" />
                <p className="mt-2 text-xs text-slate-600">Barcode (Code 128)</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
