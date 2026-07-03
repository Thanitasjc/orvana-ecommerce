"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { deleteCookie, STAFF_ROLE_KEY, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

export function AdminSidebar() {
  const pathname = usePathname();

  function logout() {
    deleteCookie(STAFF_TOKEN_KEY);
    deleteCookie(STAFF_ROLE_KEY);
    window.location.href = "/admin/login";
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-[#0b1220] text-slate-300">
      <div className="border-b border-slate-800 px-5 py-5">
        <p className="text-lg font-black tracking-wide text-white">AESTHETE</p>
        <p className="text-xs text-slate-400">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {ADMIN_NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
