import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type AdminShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AdminShell({ title, subtitle, children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-100">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
