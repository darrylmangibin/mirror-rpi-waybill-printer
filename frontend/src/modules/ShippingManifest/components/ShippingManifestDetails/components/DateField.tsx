import { formatDate } from "../../../utils/shipping-manifest.util";

interface DateFieldProps {
  label: string;
  value: string | null;
}

export const DateField = ({ label, value }: DateFieldProps) => {
  const formatted = formatDate(value);

  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      {formatted ? (
        <div className="mt-1 flex flex-col gap-0.5">
          <span className="text-sm font-medium text-slate-700">
            {formatted.date}
          </span>
          <span className="text-xs text-slate-400">{formatted.time}</span>
        </div>
      ) : (
        <p className="mt-1 text-sm font-medium text-slate-400">—</p>
      )}
    </div>
  );
};
