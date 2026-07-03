"use client";

import { useEffect, useState } from "react";
import { searchPosCustomers, type PosCustomer } from "@/lib/api/pos";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

type PosMemberSelectorProps = {
  selected: PosCustomer | null;
  onSelect: (customer: PosCustomer | null) => void;
};

function tierClass(tier?: string | null) {
  const value = (tier ?? "Silver").toLowerCase();
  if (value === "platinum") return "bg-indigo-600";
  if (value === "gold") return "bg-amber-500";
  return "bg-slate-400";
}

function tierLabel(tier?: string | null) {
  return tier ?? "Silver";
}

export function PosMemberSelector({ selected, onSelect }: PosMemberSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PosCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selected) {
      setQuery("");
      setResults([]);
      return;
    }

    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchPosCustomers(query.trim(), token);
        setResults(res.data ?? []);
      } catch {
        setError("ค้นหาสมาชิกไม่สำเร็จ");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, selected]);

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{selected.name}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black text-white ${tierClass(selected.tier)}`}>
              {tierLabel(selected.tier)} Member
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {selected.phone} | คะแนนปัจจุบัน: <strong className="text-emerald-700">{selected.points ?? 0}</strong> แต้ม
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="rounded-full px-2 py-1 text-xs text-slate-500 hover:bg-slate-200"
        >
          ลบ
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="ค้นหาสมาชิกด้วยชื่อ เบอร์โทร หรืออีเมล..."
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
      {loading ? <p className="mt-2 text-xs text-slate-400">กำลังค้นหา...</p> : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      {results.length > 0 ? (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {results.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => {
                onSelect(customer);
                setQuery("");
                setResults([]);
              }}
              className="flex w-full items-center justify-between border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50"
            >
              <span>
                <span className="font-semibold text-slate-900">{customer.name}</span>
                <span className="ml-2 text-xs text-slate-500">{customer.phone}</span>
              </span>
              <span className="text-xs text-emerald-700">{tierLabel(customer.tier)}</span>
            </button>
          ))}
        </div>
      ) : null}
      {query.trim().length >= 2 && !loading && results.length === 0 && !error ? (
        <p className="mt-2 text-xs text-slate-400">ไม่พบสมาชิก — ขายแบบ Walk-in ได้</p>
      ) : null}
    </div>
  );
}
