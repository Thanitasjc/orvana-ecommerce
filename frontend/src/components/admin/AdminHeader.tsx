"use client";

type AdminHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-[#111827] px-6 py-4">
      <div>
        <p className="text-xs text-slate-400">ยินดีต้อนรับ System Administrator</p>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          AD
        </div>
      </div>
    </header>
  );
}
