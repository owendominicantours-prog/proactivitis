type StatCardProps = {
  label: string;
  value: string;
  trend?: string;
  badge?: string;
};

export const StatCard = ({ label, value, trend, badge }: StatCardProps) => (
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
      <span>{label}</span>
      {badge && <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.65rem] font-semibold text-slate-600">{badge}</span>}
    </div>
    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    {trend && <p className="text-sm text-green-600">{trend}</p>}
  </div>
);
