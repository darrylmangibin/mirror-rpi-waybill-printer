import { cn } from "@/lib/utils";

interface DetailFieldProps {
  label: string;
  value: string | number | null;
  mono?: boolean;
}

export const DetailField = ({
  label,
  value,
  mono = false,
}: DetailFieldProps) => (
  <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p
      className={cn(
        "mt-1 bwrap-break-word text-sm font-medium text-slate-700",
        mono && "font-mono text-[13px]",
      )}
    >
      {value ?? <span className="text-slate-400">—</span>}
    </p>
  </div>
);
