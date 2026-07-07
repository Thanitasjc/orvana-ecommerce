"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { OmiseCardForm } from "@/components/shop/payment/OmiseCardForm";
import { getCookie, MEMBER_TOKEN_KEY } from "@/lib/auth/cookies";
import { formatBaht } from "@/lib/pricing/vat";
import {
  chargeOmiseCard,
  fetchOrderPayment,
  refreshOmisePayment,
  uploadPaymentSlip,
  type PublicOrderPayment,
} from "@/lib/payment/api";

type CheckoutPayPageProps = {
  orderNumber: string;
};

export function CheckoutPayPage({ orderNumber }: CheckoutPayPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? undefined;
  const memberToken = getCookie(MEMBER_TOKEN_KEY);

  const [order, setOrder] = useState<PublicOrderPayment | null>(null);
  const [omisePublicKey, setOmisePublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchOrderPayment(orderNumber, email, memberToken);
      setOrder(res.data);
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> };
      setError(apiErr.errors?.email?.[0] ?? apiErr.message ?? "โหลดออเดอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [email, memberToken, orderNumber]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    import("@/lib/payment/api").then(({ fetchPaymentMethods }) => {
      void fetchPaymentMethods().then((res) => setOmisePublicKey(res.omise_public_key));
    });
  }, []);

  async function handleSlipSubmit(event: FormEvent) {
    event.preventDefault();
    if (!slipFile) return;

    setUploading(true);
    setError(null);
    try {
      const res = await uploadPaymentSlip(orderNumber, slipFile, email, memberToken);
      setOrder(res.data);
      setMessage(res.message);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  async function handleOmiseToken(token: string) {
    setError(null);
    try {
      const res = await chargeOmiseCard(orderNumber, { omise_token: token, email }, memberToken);
      setOrder(res.data);
      if (res.charge.paid) {
        setMessage("ชำระเงินสำเร็จ");
      } else if (res.charge.failure_message) {
        setError(res.charge.failure_message);
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> };
      setError(apiErr.errors?.payment?.[0] ?? apiErr.message ?? "ชำระเงินไม่สำเร็จ");
    }
  }

  async function handlePromptPay() {
    setError(null);
    try {
      const res = await chargeOmiseCard(orderNumber, { promptpay: true, email }, memberToken);
      setOrder(res.data);
      setQrUrl(res.charge.qr_image_url ?? null);
      if (res.charge.paid) {
        setMessage("ชำระเงินสำเร็จ");
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> };
      setError(apiErr.errors?.payment?.[0] ?? apiErr.message ?? "สร้าง QR ไม่สำเร็จ");
    }
  }

  async function handleRefreshPayment() {
    setError(null);
    try {
      const res = await refreshOmisePayment(orderNumber, email, memberToken);
      setOrder(res.data);
      if (res.charge.paid) {
        setMessage("ชำระเงินสำเร็จ");
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? "ตรวจสอบสถานะไม่สำเร็จ");
    }
  }

  if (loading) {
    return (
      <section className="py-20 text-center">
        <p>กำลังโหลด...</p>
      </section>
    );
  }

  if (error && !order) {
    return (
      <section className="py-20 text-center">
        <p className="text-danger mb-4">{error}</p>
        <Link href="/shop" className="tp-btn">
          กลับหน้าร้าน
        </Link>
      </section>
    );
  }

  if (!order) return null;

  const bank = order.payment_config as { bank_name?: string; account_name?: string; account_number?: string } | null;
  const isPaid = order.payment_status === "paid";

  return (
    <section className="tp-checkout-area pb-120 pt-50" data-bg-color="#EFF1F5">
      <div className="container">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold">คำสั่งซื้อ #{order.order_number}</h1>
          <p className="mb-1 text-sm text-slate-600">
            ยอดชำระ: <strong>฿{formatBaht(order.total)}</strong>
          </p>
          <p className="mb-4 text-sm">
            สถานะ:{" "}
            <span className={isPaid ? "text-success font-bold" : "text-amber-600 font-bold"}>
              {isPaid ? "ชำระแล้ว" : "รอชำระเงิน"}
            </span>
            {" · "}
            {order.payment_method}
          </p>

          {message ? <p className="mb-4 text-sm text-success">{message}</p> : null}
          {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

          {!isPaid && order.payment_instructions ? (
            <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{order.payment_instructions}</p>
          ) : null}

          {!isPaid && order.payment_method_type === "bank_transfer" && bank?.bank_name ? (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-bold text-slate-800">โอนเข้าบัญชี</p>
              <p>ธนาคาร: {bank.bank_name}</p>
              <p>ชื่อบัญชี: {bank.account_name}</p>
              <p>เลขบัญชี: {bank.account_number}</p>
              <p className="mt-2 font-bold">ยอดที่ต้องโอน: ฿{formatBaht(order.total)}</p>
            </div>
          ) : null}

          {!isPaid && order.requires_slip ? (
            <form onSubmit={(event) => void handleSlipSubmit(event)} className="mb-6 space-y-3">
              <label className="block text-sm font-semibold">อัปโหลดสลิปโอนเงิน</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={(event) => setSlipFile(event.target.files?.[0] ?? null)}
              />
              {order.payment_slip_url ? (
                <p className="text-sm text-success">อัปโหลดสลิปแล้ว — รอตรวจสอบ</p>
              ) : null}
              <button type="submit" disabled={!slipFile || uploading} className="tp-btn">
                {uploading ? "กำลังอัปโหลด..." : "ส่งสลิป"}
              </button>
            </form>
          ) : null}

          {!isPaid && order.payment_method_type === "cod" ? (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              ออเดอร์ถูกบันทึกแล้ว — ชำระเงินสดเมื่อได้รับสินค้า
            </div>
          ) : null}

          {!isPaid && order.payment_method_type === "omise_card" && omisePublicKey ? (
            <div className="mb-6">
              <OmiseCardForm publicKey={omisePublicKey} onToken={(token) => void handleOmiseToken(token)} onError={setError} />
            </div>
          ) : null}

          {!isPaid && order.payment_method_type === "omise_promptpay" ? (
            <div className="mb-6 space-y-3">
              {!qrUrl ? (
                <button type="button" onClick={() => void handlePromptPay()} className="tp-btn w-full">
                  สร้าง QR PromptPay
                </button>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="PromptPay QR" className="mx-auto max-w-xs rounded-xl border" />
                  <button type="button" onClick={() => void handleRefreshPayment()} className="tp-btn w-full">
                    ตรวจสอบการชำระเงิน
                  </button>
                </>
              )}
            </div>
          ) : null}

          {isPaid ? (
            <div className="space-y-3">
              <p className="text-success font-semibold">ขอบคุณ — เราได้รับการชำระเงินแล้ว</p>
              {memberToken ? (
                <Link href="/account" className="tp-btn">
                  ดูออเดอร์ในบัญชี
                </Link>
              ) : (
                <Link href="/shop" className="tp-btn">
                  กลับหน้าร้าน
                </Link>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => router.push("/shop")} className="text-sm text-slate-500 underline">
              กลับหน้าร้าน (ออเดอร์ถูกบันทึกแล้ว)
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
