"use client";

import { useEffect, useState } from "react";
import type { PosCustomer } from "@/lib/api/pos";
import { PosTotalsBreakdown } from "@/components/pos/PosTotalsBreakdown";
import type { LoyaltySettings } from "@/lib/loyalty/types";
import { DEFAULT_LOYALTY_SETTINGS } from "@/lib/loyalty/types";
import type { VatBreakdown } from "@/lib/pricing/vat";

const PAYMENT_METHODS = ["PromptPay", "บัตรเครดิต", "เงินสด"] as const;

type PosCheckoutModalProps = {
  open: boolean;
  totals: VatBreakdown;
  customer: PosCustomer | null;
  loyaltySettings?: LoyaltySettings;
  pointsToRedeem: number;
  pointsDiscount: number;
  pointsEarned: number;
  onPointsToRedeemChange: (value: number) => void;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (payload: { paymentMethod: string; amountPaid?: number }) => void;
};

export function PosCheckoutModal({
  open,
  totals,
  customer,
  loyaltySettings = DEFAULT_LOYALTY_SETTINGS,
  pointsToRedeem,
  pointsDiscount,
  pointsEarned,
  onPointsToRedeemChange,
  submitting,
  error,
  onClose,
  onConfirm,
}: PosCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("เงินสด");
  const [amountPaid, setAmountPaid] = useState("");

  useEffect(() => {
    if (open) {
      setPaymentMethod("เงินสด");
      setAmountPaid(String(totals.total));
    }
  }, [open, totals.total]);

  if (!open) return null;

  const paid = Number(amountPaid) || 0;
  const change = paymentMethod === "เงินสด" ? Math.max(0, paid - totals.total) : 0;
  const cashInvalid = paymentMethod === "เงินสด" && paid < totals.total;
  const maxRedeemHint = loyaltySettings.redeem_enabled
    ? `ขั้นต่ำ ${loyaltySettings.min_redeem_points} แต้ม · ${loyaltySettings.redeem_points_per_baht} แต้ม = ฿1`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-base font-extrabold text-slate-950">ยืนยันการคิดเงินยอดออเดอร์</h4>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ปิด
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <PosTotalsBreakdown totals={totals} size="md" emphasizeTotal />
          {pointsDiscount > 0 ? (
            <p className="mt-2 text-xs font-semibold text-indigo-700">
              ส่วนลดจากแต้ม: -฿{pointsDiscount.toLocaleString("th-TH")}
            </p>
          ) : null}
        </div>

        {customer && loyaltySettings.redeem_enabled ? (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              ใช้แต้มแลกส่วนลด (คงเหลือ {customer.points ?? 0} แต้ม)
            </label>
            <input
              type="number"
              min={0}
              step={loyaltySettings.redeem_points_per_baht}
              max={customer.points ?? 0}
              value={pointsToRedeem || ""}
              onChange={(event) => onPointsToRedeemChange(Number(event.target.value) || 0)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-right text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="0"
            />
            {maxRedeemHint ? <p className="text-xs text-slate-500">{maxRedeemHint}</p> : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">ช่องทางชำระเงิน</label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`rounded-xl border py-2 text-xs font-bold transition ${
                  paymentMethod === method
                    ? "border-emerald-700 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === "เงินสด" ? (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              ยอดรับชำระจากลูกค้า (บาท)
            </label>
            <input
              type="number"
              min={0}
              value={amountPaid}
              onChange={(event) => setAmountPaid(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-right text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {paid > 0 ? (
              <div className="flex justify-between pt-1 text-xs font-bold text-indigo-600">
                <span>จำนวนเงินทอน:</span>
                <span>฿{change.toLocaleString("th-TH")}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {customer && loyaltySettings.enabled ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5 text-xs">
            <span className="font-bold text-slate-800">{customer.name}</span>
            <span className="font-semibold text-emerald-700">ได้รับแต้มสะสม: +{pointsEarned} แต้ม</span>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={submitting || cashInvalid}
          onClick={() =>
            onConfirm({
              paymentMethod,
              amountPaid: paymentMethod === "เงินสด" ? paid : undefined,
            })
          }
          className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "กำลังบันทึก..." : "ยืนยันการทำรายการและเปิดใบเสร็จ"}
        </button>
      </div>
    </div>
  );
}
