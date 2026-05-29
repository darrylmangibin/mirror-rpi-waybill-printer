import type { SummaryCardProps } from "../types";

export const SummaryCard = ({
  title,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">
          {value.toLocaleString()}
        </p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <p className="mt-3 text-sm text-slate-500">{description}</p>
  </div>
);
