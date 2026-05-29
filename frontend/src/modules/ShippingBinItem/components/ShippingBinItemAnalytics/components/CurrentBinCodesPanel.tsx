import type { CurrentBinCodesPanelProps } from "../types";

export const CurrentBinCodesPanel = ({
  title,
  description,
  data,
}: CurrentBinCodesPanelProps) => {
  const totalItems = data.reduce((sum, item) => sum + item.total_items, 0);
  const maxItems = Math.max(...data.map((item) => item.total_items), 1);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-snug text-slate-900">
            {title}
          </h2>
          <p className="text-sm leading-snug text-slate-500">{description}</p>
        </div>
        <div className="shrink-0 sm:text-right">
          <p className="text-2xl font-semibold tabular-nums text-slate-950">
            {totalItems.toLocaleString()}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            total_items
          </p>
        </div>
      </div>
      {data.length ? (
        <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1">
          {data.map((item) => {
            const width = `${Math.max((item.total_items / maxItems) * 100, 4)}%`;

            return (
              <div
                key={item.label}
                className="rounded-lg border border-slate-100 bg-slate-50/80 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 break-all font-mono text-xs font-semibold leading-relaxed text-slate-700">
                    {item.label}
                  </p>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-950">
                    {item.total_items.toLocaleString()}
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-violet-600"
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          No current-bin codes returned for this category.
        </div>
      )}
    </section>
  );
};
