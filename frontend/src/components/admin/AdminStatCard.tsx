type AdminStatCardProps = {
  label: string;
  value: string;
  accent?: "blue" | "green" | "amber" | "rose";
};

const accentMap = {
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

export function AdminStatCard({ label, value, accent = "blue" }: AdminStatCardProps) {
  return (
    <div className={`rounded-2xl border p-4 ${accentMap[accent]}`}>
      <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
