import { formatDateTime } from "../utils";

export const DateCell = ({ value }: { value: string | null }) => {
  const formatted = formatDateTime(value);

  if (!formatted) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-slate-700">
        {formatted.date}
      </span>
      <span className="text-xs text-slate-400">{formatted.time}</span>
    </div>
  );
};
