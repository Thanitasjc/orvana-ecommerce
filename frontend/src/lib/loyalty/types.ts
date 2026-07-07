export type LoyaltySettings = {
  enabled: boolean;
  baht_per_point: number;
  min_spend: number;
  gold_threshold: number;
  platinum_threshold: number;
  redeem_enabled: boolean;
  redeem_points_per_baht: number;
  min_redeem_points: number;
  max_redeem_percent: number;
};

export type LoyaltyPreview = {
  settings: LoyaltySettings;
  points_discount: number;
  points_used: number;
  final_total: number;
  points_earned: number;
};

export type LoyaltyTransaction = {
  id: number;
  customer_id: number;
  order_id?: number | null;
  type: "earn" | "redeem" | "adjust" | "cancel";
  points: number;
  balance_after: number;
  description?: string | null;
  created_at?: string;
  order?: { id: number; order_number: string } | null;
};

export const DEFAULT_LOYALTY_SETTINGS: LoyaltySettings = {
  enabled: true,
  baht_per_point: 100,
  min_spend: 0,
  gold_threshold: 10000,
  platinum_threshold: 25000,
  redeem_enabled: true,
  redeem_points_per_baht: 10,
  min_redeem_points: 100,
  max_redeem_percent: 50,
};
