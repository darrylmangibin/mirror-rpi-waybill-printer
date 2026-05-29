import type { ValueListPanelProps } from "../types";
import { formatLabel } from "../utils";

export const ValueListPanel = ({
  title,
  description,
  values,
}: ValueListPanelProps) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="sm:text-right">
        <p className="text-2xl font-semibold tabular-nums text-slate-950">
          {values.length.toLocaleString()}
        </p>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          count
        </p>
      </div>
    </div>
    {values.length ? (
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-medium text-slate-700"
          >
            {formatLabel(value)}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-slate-500">No values returned.</p>
    )}
  </section>
);
