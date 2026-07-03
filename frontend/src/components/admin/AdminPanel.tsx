import type { ReactNode } from "react";

type AdminPanelProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminPanel({ title, action, children, className = "" }: AdminPanelProps) {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-[#111827] ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
