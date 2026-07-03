"use client";

import type { VatBreakdown } from "@/lib/pricing/vat";
import { formatBaht, VAT_PERCENT } from "@/lib/pricing/vat";

type PosTotalsBreakdownProps = {
  totals: VatBreakdown;
  size?: "sm" | "md";
  showSubtotal?: boolean;
  showDiscount?: boolean;
  emphasizeTotal?: boolean;
};

export function PosTotalsBreakdown({
  totals,
  size = "sm",
  showSubtotal = true,
  showDiscount = true,
  emphasizeTotal = false,
}: PosTotalsBreakdownProps) {
  const textClass = size === "sm" ? "text-xs" : "text-sm";
  const totalClass = emphasizeTotal ? "text-base font-black" : `${textClass} font-bold`;

  return (
    <div className={`space-y-1.5 ${textClass} text-slate-600`}>
      {showSubtotal ? (
        <div className="flex justify-between">
          <span>ราคาสินค้ารวม (รวม VAT)</span>
          <span>฿{formatBaht(totals.subtotal)}</span>
        </div>
      ) : null}
      {showDiscount && totals.discount > 0 ? (
        <div className="flex justify-between text-rose-500">
          <span>ส่วนลด</span>
          <span>-฿{formatBaht(totals.discount)}</span>
        </div>
      ) : null}
      <div className="flex justify-between">
        <span>มูลค่าก่อน VAT</span>
        <span>฿{formatBaht(totals.amountBeforeVat)}</span>
      </div>
      <div className="flex justify-between">
        <span>VAT {VAT_PERCENT}%</span>
        <span>฿{formatBaht(totals.vatAmount)}</span>
      </div>
      <div className={`flex justify-between border-t border-slate-200/80 pt-1.5 text-slate-900 ${totalClass}`}>
        <span>ยอดชำระทั้งสิ้น (รวม VAT)</span>
        <span>฿{formatBaht(totals.total)}</span>
      </div>
    </div>
  );
}
