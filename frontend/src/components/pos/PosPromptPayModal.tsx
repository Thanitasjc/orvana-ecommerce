"use client";

import { useCallback, useEffect, useState } from "react";
import {
  chargePosPromptPay,
  fetchPosOrder,
  refreshPosPromptPay,
  type PosOrder,
} from "@/lib/api/pos";
import { formatBaht } from "@/lib/pricing/vat";

type PosPromptPayModalProps = {
  open: boolean;
  orderNumber: string;
  token: string;
  onPaid: (order: PosOrder) => void;
  onCancel: () => void;
};

export function PosPromptPayModal({
  open,
  orderNumber,
  token,
  onPaid,
  onCancel,
}: PosPromptPayModalProps) {
  const [order, setOrder] = useState<PosOrder | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAndCharge = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const orderRes = await fetchPosOrder(orderNumber, token);
      setOrder(orderRes.data);

      if (orderRes.data.payment_status === "paid") {
        onPaid(orderRes.data);
        return;
      }

      const chargeRes = await chargePosPromptPay(orderNumber, token);
      setOrder(chargeRes.data);
      setQrUrl(chargeRes.charge.qr_image_url ?? null);

      if (chargeRes.data.payment_status === "paid") {
        onPaid(chargeRes.data);
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> };
      setError(apiErr.errors?.payment?.[0] ?? apiErr.message ?? "สร้าง QR ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [onPaid, orderNumber, token]);

  useEffect(() => {
    if (!open) {
      setOrder(null);
      setQrUrl(null);
      setError(null);
      return;
    }

    void loadAndCharge();
  }, [open, loadAndCharge]);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);

    try {
      const res = await refreshPosPromptPay(orderNumber, token);
      setOrder(res.data);
      setQrUrl(res.charge.qr_image_url ?? qrUrl);

      if (res.data.payment_status === "paid") {
        onPaid(res.data);
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? "ตรวจสอบสถานะไม่สำเร็จ");
    } finally {
      setRefreshing(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-slate-150 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <h4 className="text-base font-extrabold text-slate-950">PromptPay QR</h4>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            ยกเลิก
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="text-center text-sm text-slate-600">
            <p className="font-bold text-slate-900">#{orderNumber}</p>
            {order ? <p className="mt-1">ยอดชำระ: ฿{formatBaht(order.total)}</p> : null}
          </div>

          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">กำลังสร้าง QR...</p>
          ) : null}

          {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}

          {qrUrl ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="PromptPay QR"
                className="mx-auto w-full max-w-[240px] rounded-xl border sm:max-w-xs"
              />
              <p className="text-center text-xs text-slate-500">ให้ลูกค้าสแกน QR เพื่อชำระเงิน</p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-slate-100 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={loading || refreshing || !qrUrl}
            className="flex-1 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {refreshing ? "กำลังตรวจสอบ..." : "ตรวจสอบการชำระเงิน"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-600"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
