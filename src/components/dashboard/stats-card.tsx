import { formatCurrency } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  currency,
}: {
  label: string;
  value: number;
  currency?: boolean;
}) {
  return (
    <div className="card-surface p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">
        {currency ? formatCurrency(value) : value}
      </p>
    </div>
  );
}
