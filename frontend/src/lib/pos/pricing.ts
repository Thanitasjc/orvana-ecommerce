export {
  VAT_RATE as POS_VAT_RATE,
  VAT_PERCENT as POS_VAT_PERCENT,
  type VatBreakdown as PosVatBreakdown,
  calculateVatFromInclusiveTotal,
  calculateTotalsWithDiscount as calculatePosTotals,
  formatBaht,
} from "@/lib/pricing/vat";
