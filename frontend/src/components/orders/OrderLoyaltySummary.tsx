import type { Order } from "@/lib/orders/types";
import { calculateOrderTotals } from "@/lib/orders/orderTotals";

type OrderLoyaltySummaryProps = {
  order: Order;
  variant?: "admin" | "shop";
};

export function OrderLoyaltySummary({ order, variant = "admin" }: OrderLoyaltySummaryProps) {
  const totals = calculateOrderTotals(order);
  const hasLoyalty =
    totals.pointsRedeemed > 0 || totals.pointsEarned > 0 || totals.loyaltyReversed;

  if (!hasLoyalty) {
    return null;
  }

  const isAdmin = variant === "admin";

  return (
    <div
      className={
        isAdmin
          ? "mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
          : "mb-20 rounded px-3 py-3"
      }
      style={isAdmin ? undefined : { border: "1px solid #a7f3d0", background: "#ecfdf5" }}
    >
      <p
        className={
          isAdmin
            ? "mb-2 text-sm font-semibold text-emerald-300"
            : "mb-2 fw-semibold text-success"
        }
      >
        แต้มสะสม
      </p>
      <div className={isAdmin ? "space-y-1 text-sm text-slate-200" : "small text-muted"}>
        {totals.pointsRedeemed > 0 ? (
          <p className={isAdmin ? "mb-1" : "mb-1"}>
            ใช้แต้ม: <strong>{totals.pointsRedeemed}</strong> แต้ม
            {totals.pointsDiscount > 0 ? (
              <span> (ส่วนลด ฿{totals.pointsDiscount.toLocaleString("th-TH")})</span>
            ) : null}
          </p>
        ) : null}
        {totals.pointsEarned > 0 ? (
          <p className={isAdmin ? "mb-0 text-emerald-300" : "mb-0 text-success"}>
            ได้รับแต้ม: <strong>+{totals.pointsEarned}</strong> แต้ม
            {totals.loyaltyReversed ? (
              <span className={isAdmin ? "text-slate-400" : "text-muted"}> (คืนแต้มแล้ว)</span>
            ) : null}
          </p>
        ) : null}
        {totals.loyaltyReversed && totals.pointsEarned === 0 && totals.pointsRedeemed === 0 ? (
          <p className="mb-0">คืนแต้มจากการยกเลิกออเดอร์แล้ว</p>
        ) : null}
      </div>
    </div>
  );
}
