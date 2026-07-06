import type { Order } from "@/lib/orders/types";
import { formatMoney } from "@/lib/orders/types";
import {
  calculateOrderTotals,
  discountLabel,
} from "@/lib/orders/orderTotals";
import { VAT_PERCENT } from "@/lib/pricing/vat";

type OrderTotalsSummaryProps = {
  order: Order;
  variant?: "admin" | "shop";
};

export function OrderTotalsSummary({ order, variant = "admin" }: OrderTotalsSummaryProps) {
  const totals = calculateOrderTotals(order);
  const isAdmin = variant === "admin";

  const rowClass = isAdmin
    ? "flex justify-between text-sm text-slate-300"
    : "d-flex justify-content-between text-muted small mb-1";
  const discountClass = isAdmin
    ? "flex justify-between text-sm font-medium text-rose-400"
    : "d-flex justify-content-between text-danger small mb-1";
  const totalClass = isAdmin
    ? "mt-2 text-lg font-bold text-white"
    : "mb-0";

  return (
    <div className={isAdmin ? "mt-5 space-y-1 text-right" : "text-end"}>
      <div className={rowClass}>
        <span>ยอดสินค้า</span>
        <span>฿{formatMoney(totals.subtotal)}</span>
      </div>

      {totals.discount > 0 ? (
        <div className={discountClass}>
          <span>{discountLabel(totals)}</span>
          <span>-฿{formatMoney(totals.discount)}</span>
        </div>
      ) : null}

      {totals.shippingFee > 0 ? (
        <div className={rowClass}>
          <span>ค่าจัดส่ง</span>
          <span>฿{formatMoney(totals.shippingFee)}</span>
        </div>
      ) : null}

      {totals.shippingDiscount > 0 ? (
        <div className={discountClass}>
          <span>ส่วนลดค่าส่ง</span>
          <span>-฿{formatMoney(totals.shippingDiscount)}</span>
        </div>
      ) : null}

      <div className={isAdmin ? "pt-2 text-xs text-slate-500" : "mb-5 text-muted small"}>
        มูลค่าก่อน VAT: ฿{formatMoney(totals.amountBeforeVat)} | VAT {VAT_PERCENT}%: ฿
        {formatMoney(totals.vatAmount)}
      </div>

      <p className={totalClass}>ยอดรวม (รวม VAT): ฿{formatMoney(totals.total)}</p>
    </div>
  );
}
