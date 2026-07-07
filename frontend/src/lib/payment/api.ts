import { apiFetch, apiUpload } from "@/lib/api/client";

export type PaymentMethodType =
  | "bank_transfer"
  | "cod"
  | "omise_card"
  | "omise_promptpay"
  | "pos_cash"
  | "pos_card";

export type BankTransferConfig = {
  bank_name?: string;
  account_name?: string;
  account_number?: string;
};

export type PaymentMethod = {
  id: number;
  name: string;
  type: PaymentMethodType;
  description: string | null;
  instructions: string | null;
  config: BankTransferConfig | Record<string, unknown> | null;
  channel: string;
  sort_order: number;
  is_active: boolean;
  requires_slip: boolean;
  is_gateway: boolean;
  omise_enabled: boolean;
};

export type PublicOrderPayment = {
  id: number;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_method_id: number | null;
  payment_method_type?: PaymentMethodType;
  payment_instructions?: string | null;
  payment_config?: BankTransferConfig | Record<string, unknown> | null;
  requires_slip: boolean;
  is_gateway: boolean;
  payment_slip_url: string | null;
  omise_charge_id: string | null;
  payment_metadata?: Record<string, unknown> | null;
  created_at?: string;
  items?: { product_name: string; quantity: number; price: number }[];
};

export type OmiseChargeResult = {
  id: string | null;
  status: string | null;
  paid: boolean;
  authorize_uri?: string | null;
  qr_image_url?: string | null;
  failure_message?: string | null;
};

export async function fetchPaymentMethods(channel = "online") {
  return apiFetch<{
    data: PaymentMethod[];
    omise_public_key: string | null;
    omise_configured: boolean;
  }>(`/payment/methods?channel=${channel}`);
}

export async function fetchOrderPayment(orderNumber: string, email?: string, token?: string | null) {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiFetch<{ data: PublicOrderPayment }>(`/checkout/orders/${orderNumber}${query}`, { token });
}

export async function uploadPaymentSlip(orderNumber: string, file: File, email?: string, token?: string | null) {
  const formData = new FormData();
  formData.append("slip", file);
  if (email) formData.append("email", email);

  return apiUpload<{ data: PublicOrderPayment; message: string }>(
    `/checkout/orders/${orderNumber}/slip`,
    formData,
    token,
  );
}

export async function chargeOmiseCard(
  orderNumber: string,
  payload: { omise_token?: string; promptpay?: boolean; email?: string },
  token?: string | null,
) {
  return apiFetch<{ data: PublicOrderPayment; charge: OmiseChargeResult }>(
    `/checkout/orders/${orderNumber}/omise/charge`,
    {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    },
  );
}

export async function refreshOmisePayment(orderNumber: string, email?: string, token?: string | null) {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiFetch<{ data: PublicOrderPayment; charge: OmiseChargeResult }>(
    `/checkout/orders/${orderNumber}/omise/refresh${query}`,
    { token },
  );
}

export function formatBankTransferConfig(config?: BankTransferConfig | Record<string, unknown> | null) {
  const bank = config as BankTransferConfig | undefined;
  if (!bank?.bank_name) return null;
  return `${bank.bank_name} · ${bank.account_name ?? ""} · ${bank.account_number ?? ""}`.trim();
}
