export type OrderItem = {
  product_name: string;
  quantity: number;
  price: number;
  color?: string | null;
  size?: string | null;
};

export type OrderCustomer = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

export type Order = {
  id: number;
  order_number: string;
  total: number | string;
  discount?: number | string;
  points_redeemed?: number | string;
  points_discount?: number | string;
  points_earned?: number | string;
  loyalty_reversed_at?: string | null;
  coupon_code?: string | null;
  shipping_fee?: number | string;
  shipping_discount?: number | string;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  channel: string;
  created_at?: string;
  customer?: OrderCustomer | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  shipping_address?: string | null;
  shipping_province?: string | null;
  shipping_postcode?: string | null;
  shipping_notes?: string | null;
  shipping_method_name?: string | null;
  items?: OrderItem[];
};

export function orderCustomerName(order: Order) {
  return order.customer?.name ?? order.guest_name ?? "Walk-in";
}

export function orderStatusClass(status: string, paymentStatus: string) {
  const value = status.toLowerCase();

  if (value === "completed" || paymentStatus.toLowerCase() === "paid") return "done";
  if (value === "pending") return "pending";
  if (value === "cancelled" || value === "on_hold") return "hold";
  if (value === "processing") return "reply";

  return "reply";
}

export function orderStatusLabel(status: string, paymentStatus: string) {
  const value = status.toLowerCase();

  if (value === "completed" && paymentStatus.toLowerCase() === "paid") return "Resolved";
  if (value === "pending") return "Pending";
  if (value === "cancelled") return "On Hold";
  if (value === "processing") return "Need your replay";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function orderViewLabel(status: string, paymentStatus: string) {
  const value = status.toLowerCase();

  if (value === "processing" || paymentStatus.toLowerCase() === "pending") return "Reply";
  if (value === "cancelled" || value === "on_hold") return "Status";

  return "Invoice";
}

export function orderProductTitle(order: Order) {
  const items = order.items ?? [];
  if (items.length === 0) return "-";

  const first = items[0];
  if (items.length === 1) {
    return items[0].quantity > 1 ? `${first.product_name} x ${first.quantity}` : first.product_name;
  }

  return `${first.product_name} +${items.length - 1} more`;
}

export function formatMoney(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString("th-TH") : "0";
}

export const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "รอดำเนินการ" },
  { value: "processing", label: "กำลังจัดส่ง" },
  { value: "completed", label: "สำเร็จ" },
  { value: "cancelled", label: "ยกเลิก" },
  { value: "on_hold", label: "พักไว้" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "รอชำระ" },
  { value: "paid", label: "ชำระแล้ว" },
  { value: "refunded", label: "คืนเงินแล้ว" },
] as const;

export function orderStatusText(status: string) {
  return ORDER_STATUS_OPTIONS.find((item) => item.value === status.toLowerCase())?.label ?? status;
}

export function paymentStatusText(status: string) {
  return PAYMENT_STATUS_OPTIONS.find((item) => item.value === status.toLowerCase())?.label ?? status;
}
