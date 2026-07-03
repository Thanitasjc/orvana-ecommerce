import { formatBaht, VAT_PERCENT } from "@/lib/pricing/vat";
import type { ShopOrderTotals } from "@/lib/shop/orderTotals";

type ShopVatSummaryProps = {
  totals: ShopOrderTotals;
  variant: "checkout" | "cart";
};

export function ShopVatSummary({ totals, variant }: ShopVatSummaryProps) {
  if (totals.total <= 0) return null;

  if (variant === "checkout") {
    return (
      <>
        <li className="tp-order-info-list-subtotal">
          <span>มูลค่าก่อน VAT</span>
          <span>฿{formatBaht(totals.amountBeforeVat)}</span>
        </li>
        <li className="tp-order-info-list-subtotal">
          <span>VAT {VAT_PERCENT}%</span>
          <span>฿{formatBaht(totals.vatAmount)}</span>
        </li>
      </>
    );
  }

  return (
    <div className="tp-cart-checkout-vat mb-15">
      <div className="d-flex align-items-center justify-content-between mb-5">
        <span className="tp-cart-checkout-top-title">มูลค่าก่อน VAT</span>
        <span className="tp-cart-checkout-top-price">฿{formatBaht(totals.amountBeforeVat)}</span>
      </div>
      <div className="d-flex align-items-center justify-content-between mb-5">
        <span className="tp-cart-checkout-top-title">VAT {VAT_PERCENT}%</span>
        <span className="tp-cart-checkout-top-price">฿{formatBaht(totals.vatAmount)}</span>
      </div>
      <p className="mb-0" style={{ fontSize: "11px", color: "#77808d" }}>
        * ราคาสินค้าและยอดชำระรวม VAT {VAT_PERCENT}% แล้ว
      </p>
    </div>
  );
}
