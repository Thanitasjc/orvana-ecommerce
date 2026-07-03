import { calculateVatFromInclusiveTotal, type VatBreakdown } from "@/lib/pricing/vat";

export type ShopOrderTotals = VatBreakdown & {
  shippingFee: number;
};

export function getShopShippingFee(subtotal: number) {
  return subtotal > 0 && subtotal < 300 ? 20 : 0;
}

export function calculateShopTotals(subtotal: number, shippingFee = getShopShippingFee(subtotal)): ShopOrderTotals {
  const payableTotal = subtotal + shippingFee;
  const vat = calculateVatFromInclusiveTotal(payableTotal);

  return {
    subtotal,
    discount: 0,
    shippingFee,
    amountBeforeVat: vat.amountBeforeVat,
    vatAmount: vat.vatAmount,
    total: vat.total,
  };
}
