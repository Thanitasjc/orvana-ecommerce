export const VAT_RATE = 0.07;
export const VAT_PERCENT = 7;

export type VatBreakdown = {
  subtotal: number;
  discount: number;
  amountBeforeVat: number;
  vatAmount: number;
  total: number;
};

/** Prices are VAT-inclusive (ราคาขายรวม VAT แล้ว) */
export function calculateVatFromInclusiveTotal(inclusiveTotal: number) {
  const total = Math.max(0, Math.round(inclusiveTotal));
  const vatAmount = Math.round((total * VAT_RATE) / (1 + VAT_RATE));
  const amountBeforeVat = total - vatAmount;

  return { amountBeforeVat, vatAmount, total };
}

export function calculateTotalsWithDiscount(subtotal: number, discount: number): VatBreakdown {
  const total = Math.max(0, subtotal - discount);
  const vat = calculateVatFromInclusiveTotal(total);

  return {
    subtotal,
    discount,
    amountBeforeVat: vat.amountBeforeVat,
    vatAmount: vat.vatAmount,
    total: vat.total,
  };
}

export function formatBaht(value: number, fractionDigits = 2) {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
