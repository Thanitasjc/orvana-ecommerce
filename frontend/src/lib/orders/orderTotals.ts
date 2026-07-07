import type { Order } from "@/lib/orders/types";
import { formatMoney } from "@/lib/orders/types";
import { calculateVatFromInclusiveTotal, VAT_PERCENT } from "@/lib/pricing/vat";

export type OrderTotalsBreakdown = {
  subtotal: number;
  discount: number;
  couponCode: string | null;
  pointsDiscount: number;
  pointsRedeemed: number;
  pointsEarned: number;
  loyaltyReversed: boolean;
  shippingFee: number;
  shippingDiscount: number;
  payableShipping: number;
  amountBeforeVat: number;
  vatAmount: number;
  total: number;
};

function toAmount(value: number | string | undefined | null, fallback = 0) {
  const amount = typeof value === "number" ? value : Number(value ?? fallback);
  return Number.isFinite(amount) ? amount : fallback;
}

export function calculateOrderItemSubtotal(order: Order) {
  return (order.items ?? []).reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateOrderTotals(order: Order): OrderTotalsBreakdown {
  const subtotal = calculateOrderItemSubtotal(order);
  const discount = toAmount(order.discount);
  const pointsDiscount = toAmount(order.points_discount);
  const pointsRedeemed = toAmount(order.points_redeemed);
  const pointsEarned = toAmount(order.points_earned);
  const shippingFee = toAmount(order.shipping_fee);
  const shippingDiscount = toAmount(order.shipping_discount);
  const payableShipping = Math.max(0, shippingFee - shippingDiscount);
  const total = toAmount(order.total);
  const vat = calculateVatFromInclusiveTotal(total);

  return {
    subtotal,
    discount,
    couponCode: order.coupon_code?.trim() || null,
    pointsDiscount,
    pointsRedeemed,
    pointsEarned,
    loyaltyReversed: Boolean(order.loyalty_reversed_at),
    shippingFee,
    shippingDiscount,
    payableShipping,
    amountBeforeVat: vat.amountBeforeVat,
    vatAmount: vat.vatAmount,
    total,
  };
}

export function discountLabel(totals: OrderTotalsBreakdown) {
  if (totals.couponCode) {
    return `ส่วนลด (${totals.couponCode})`;
  }
  return "ส่วนลด";
}

export function buildOrderTotalsPrintHtml(
  totals: OrderTotalsBreakdown,
  options?: { discountClass?: string },
) {
  const discountClass = options?.discountClass ?? "total-row discount";
  const lines: string[] = [];

  lines.push(
    `<div class="total-row"><span>ยอดสินค้า:</span><span>฿${formatMoney(totals.subtotal)}</span></div>`,
  );

  if (totals.discount > 0) {
    lines.push(
      `<div class="${discountClass}"><span>${discountLabel(totals)}:</span><span>-฿${formatMoney(totals.discount)}</span></div>`,
    );
  }

  if (totals.pointsDiscount > 0) {
    lines.push(
      `<div class="${discountClass}"><span>ส่วนลดแต้ม (${totals.pointsRedeemed} แต้ม):</span><span>-฿${formatMoney(totals.pointsDiscount)}</span></div>`,
    );
  }

  if (totals.shippingFee > 0) {
    lines.push(
      `<div class="total-row"><span>ค่าจัดส่ง:</span><span>฿${formatMoney(totals.shippingFee)}</span></div>`,
    );
  }

  if (totals.shippingDiscount > 0) {
    lines.push(
      `<div class="${discountClass}"><span>ส่วนลดค่าส่ง:</span><span>-฿${formatMoney(totals.shippingDiscount)}</span></div>`,
    );
  }

  if (totals.payableShipping > 0 && totals.shippingFee !== totals.payableShipping) {
    lines.push(
      `<div class="total-row"><span>ค่าจัดส่งสุทธิ:</span><span>฿${formatMoney(totals.payableShipping)}</span></div>`,
    );
  }

  lines.push(
    `<div class="total-row"><span>มูลค่าก่อน VAT:</span><span>฿${formatMoney(totals.amountBeforeVat)}</span></div>`,
    `<div class="total-row"><span>VAT ${VAT_PERCENT}%:</span><span>฿${formatMoney(totals.vatAmount)}</span></div>`,
    `<div class="grand-total"><span>รวมสุทธิ (รวม VAT):</span><span>฿${formatMoney(totals.total)}</span></div>`,
  );

  if (totals.pointsEarned > 0) {
    const earnNote = totals.loyaltyReversed ? " (คืนแต้มแล้ว)" : "";
    lines.push(
      `<div class="total-row"><span>แต้มที่ได้รับ${earnNote}:</span><span>+${totals.pointsEarned} แต้ม</span></div>`,
    );
  }

  return lines.join("\n");
}
