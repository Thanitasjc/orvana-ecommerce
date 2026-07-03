"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import {
  STAFF_ROLE_KEY,
  STAFF_TOKEN_KEY,
  setCookie,
} from "@/lib/auth/cookies";

export default function PosLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    try {
      const res = await apiFetch<{
        data: { token: string; user: { role: string } };
      }>("/staff/pos/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      setCookie(STAFF_TOKEN_KEY, res.data.token);
      setCookie(STAFF_ROLE_KEY, res.data.user.role);
      router.push("/pos");
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "เข้าสู่ระบบไม่สำเร็จ");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">POS หน้าร้าน</h1>
        <p className="mt-2 text-sm text-slate-500">
          สำหรับพนักงานขายเท่านั้น — สมาชิกไม่สามารถเข้าใช้งานหน้านี้
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="อีเมลพนักงาน"
            className="w-full rounded-lg border px-3 py-2"
            defaultValue="cashier@aesthete.local"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="รหัสผ่าน"
            className="w-full rounded-lg border px-3 py-2"
            defaultValue="password"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700"
          >
            เข้าสู่ระบบ POS
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/">กลับหน้าร้าน</Link>
        </p>
      </div>
    </div>
  );
}
