"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { STAFF_ROLE_KEY, STAFF_TOKEN_KEY, setCookie } from "@/lib/auth/cookies";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    try {
      const res = await apiFetch<{
        data: { token: string; user: { role: string } };
      }>("/staff/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      setCookie(STAFF_TOKEN_KEY, res.data.token);
      setCookie(STAFF_ROLE_KEY, res.data.user.role);
      router.push("/admin");
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "เข้าสู่ระบบไม่สำเร็จ");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Admin หลังบ้าน</h1>
        <p className="mt-2 text-sm text-slate-400">เฉพาะผู้ดูแลระบบ (role: admin)</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            name="email"
            type="email"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            defaultValue="admin@aesthete.local"
            required
          />
          <input
            name="password"
            type="password"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            defaultValue="password"
            required
          />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-500"
          >
            เข้าสู่ระบบ Admin
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/" className="hover:text-white">
            กลับหน้าร้าน
          </Link>
        </p>
      </div>
    </div>
  );
}
