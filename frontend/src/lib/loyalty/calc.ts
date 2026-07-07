import type { LoyaltySettings } from "@/lib/loyalty/types";
import { DEFAULT_LOYALTY_SETTINGS } from "@/lib/loyalty/types";

export function calcEarnPoints(payableTotal: number, settings: LoyaltySettings = DEFAULT_LOYALTY_SETTINGS) {
  if (!settings.enabled || payableTotal < settings.min_spend) {
    return 0;
  }

  const bahtPerPoint = Math.max(1, settings.baht_per_point);
  return Math.floor(payableTotal / bahtPerPoint);
}

export function calcRedeemDiscount(
  pointsToRedeem: number,
  customerBalance: number,
  payableAfterCoupon: number,
  settings: LoyaltySettings = DEFAULT_LOYALTY_SETTINGS,
) {
  if (!settings.redeem_enabled || pointsToRedeem <= 0 || payableAfterCoupon <= 0) {
    return { pointsUsed: 0, discount: 0 };
  }

  const rate = Math.max(1, settings.redeem_points_per_baht);
  const minRedeem = Math.max(1, settings.min_redeem_points);
  const maxPercent = Math.min(100, Math.max(1, settings.max_redeem_percent));

  const maxDiscountByPercent = Math.floor((payableAfterCoupon * maxPercent) / 100);
  const maxPointsByPercent = maxDiscountByPercent * rate;

  const requestedPoints = Math.min(pointsToRedeem, customerBalance, maxPointsByPercent);
  const usablePoints = Math.floor(requestedPoints / rate) * rate;

  if (usablePoints < minRedeem) {
    return { pointsUsed: 0, discount: 0 };
  }

  const discount = Math.min(Math.floor(usablePoints / rate), payableAfterCoupon);

  return {
    pointsUsed: discount * rate,
    discount,
  };
}

export function calcLoyaltyCheckout(
  subtotal: number,
  couponDiscount: number,
  pointsToRedeem: number,
  customerBalance: number,
  settings: LoyaltySettings = DEFAULT_LOYALTY_SETTINGS,
) {
  const payableAfterCoupon = Math.max(0, subtotal - couponDiscount);
  const redeem = calcRedeemDiscount(pointsToRedeem, customerBalance, payableAfterCoupon, settings);
  const finalTotal = Math.max(0, payableAfterCoupon - redeem.discount);
  const pointsEarned = calcEarnPoints(finalTotal, settings);

  return {
    payableAfterCoupon,
    pointsDiscount: redeem.discount,
    pointsUsed: redeem.pointsUsed,
    finalTotal,
    pointsEarned,
  };
}
