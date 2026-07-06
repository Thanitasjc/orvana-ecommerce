import { calculateVatFromInclusiveTotal, type VatBreakdown } from "@/lib/pricing/vat";

export type ShopOrderTotals = VatBreakdown & {
  shippingFee: number;
  shippingDiscount: number;
};

export function getShopShippingFee(subtotal: number) {
  return subtotal > 0 && subtotal < 300 ? 20 : 0;
}

export function calculateShopTotals(
  subtotal: number,
  discount = 0,
  shippingFee?: number,
  shippingDiscount = 0,
): ShopOrderTotals {
  const shipping = shippingFee ?? getShopShippingFee(subtotal);
  const payableShipping = Math.max(0, shipping - shippingDiscount);
  const afterDiscount = Math.max(0, subtotal - discount);
  const payableTotal = afterDiscount + payableShipping;
  const vat = calculateVatFromInclusiveTotal(payableTotal);

  return {
    subtotal,
    discount,
    shippingFee: shipping,
    shippingDiscount,
    amountBeforeVat: vat.amountBeforeVat,
    vatAmount: vat.vatAmount,
    total: vat.total,
  };
}
