"use client";

import Script from "next/script";
import { FormEvent, useEffect, useState } from "react";

type OmiseCardFormProps = {
  publicKey: string;
  disabled?: boolean;
  onToken: (token: string) => void;
  onError: (message: string) => void;
};

type OmiseCard = {
  number: string;
  expiration_month: number;
  expiration_year: number;
  security_code: string;
  name: string;
};

type OmiseStatic = {
  setPublicKey: (key: string) => void;
  createToken: (
    type: string,
    card: OmiseCard,
    callback: (statusCode: number, response: { id?: string; message?: string }) => void,
  ) => void;
};

declare global {
  interface Window {
    Omise?: OmiseStatic;
  }
}

export function OmiseCardForm({ publicKey, disabled, onToken, onError }: OmiseCardFormProps) {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && window.Omise && publicKey) {
      window.Omise.setPublicKey(publicKey);
    }
  }, [ready, publicKey]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!window.Omise) {
      onError("Omise.js ยังโหลดไม่เสร็จ");
      return;
    }

    const [month, year] = expiry.split("/").map((part) => part.trim());
    if (!month || !year) {
      onError("กรุณากรอกวันหมดอายุ MM/YY");
      return;
    }

    setSubmitting(true);
    window.Omise.createToken(
      "card",
      {
        name,
        number: number.replace(/\s/g, ""),
        expiration_month: Number(month),
        expiration_year: 2000 + Number(year),
        security_code: cvc,
      },
      (statusCode, response) => {
        setSubmitting(false);
        if (statusCode !== 200 || !response.id) {
          onError(response.message ?? "ไม่สามารถสร้าง token บัตรได้");
          return;
        }
        onToken(response.id);
      },
    );
  }

  return (
    <>
      <Script src="https://cdn.omise.co/omise.js" onLoad={() => setReady(true)} strategy="afterInteractive" />
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">ข้อมูลบัตร (Omise Test Mode)</p>
        <p className="text-xs text-slate-500">ทดสอบ: 4242 4242 4242 4242 · 任意วันหมดอายุ · CVC 123</p>
        <input
          required
          placeholder="ชื่อบนบัตร"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          disabled={disabled || submitting}
        />
        <input
          required
          placeholder="หมายเลขบัตร"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          disabled={disabled || submitting}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="MM/YY"
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={disabled || submitting}
          />
          <input
            required
            placeholder="CVC"
            value={cvc}
            onChange={(event) => setCvc(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={disabled || submitting}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || submitting || !ready}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? "กำลังตรวจสอบบัตร..." : "ชำระด้วยบัตร"}
        </button>
      </form>
    </>
  );
}
