import { cn } from "@/lib/utils";
import { formatLabel } from "../../utils/shipping-manifest.util";
import type { ShippingManifestStatus } from "../../types/shipping-manifest.type";

type StatusConfig = {
  bg: string;
  text: string;
  border: string;
  dot: string;
};

const statusConfig: Partial<Record<ShippingManifestStatus, StatusConfig>> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  processing: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  sweeping: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    dot: "bg-cyan-400",
  },
  staging: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    dot: "bg-indigo-400",
  },
  for_delivery: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-400",
  },
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  open: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-400",
  },
  closed: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  for_loading: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-400",
  },
  loaded: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-400",
  },
};

const defaultStatusConfig: StatusConfig = {
  bg: "bg-gray-50",
  text: "text-gray-600",
  border: "border-gray-200",
  dot: "bg-gray-400",
};

export const StatusBadge = ({ status }: { status: ShippingManifestStatus }) => {
  const cfg = statusConfig[status] ?? defaultStatusConfig;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        cfg.bg,
        cfg.text,
        cfg.border,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {formatLabel(status)}
    </span>
  );
};
