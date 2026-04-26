import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ShippingManifestListStatus } from "@/modules/ShippingManifest/types/shipping-manifest.type";
import { formatDate, formatLabel } from "../../utils/shipping-manifest.util";

type StatusConfig = {
  bg: string;
  text: string;
  border: string;
  dot: string;
};

const statusConfig: Record<ShippingManifestListStatus, StatusConfig> = {
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
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
};

const defaultStatusConfig: StatusConfig = {
  bg: "bg-gray-50",
  text: "text-gray-600",
  border: "border-gray-200",
  dot: "bg-gray-400",
};

export const StatusBadge = ({ status }: { status: ShippingManifestListStatus }) => {
  const config = statusConfig[status] || defaultStatusConfig;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        config.bg,
        config.text,
        config.border,
      )}
    >
      <div className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {formatLabel(status)}
    </div>
  );
};

export const DateCell = ({ value }: { value: string | null }) => {
  const formatted = formatDate(value);
  if (!formatted) return <span className="text-slate-400 text-sm">—</span>;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-slate-700">
        {formatted.date}
      </span>
      <span className="text-xs text-slate-400">{formatted.time}</span>
    </div>
  );
};

export const TableSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border rounded-xl">
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);

export const EmptyState = ({ onReset }: { onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
      <FileText className="h-8 w-8 text-slate-300" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900">No manifests found</h3>
    <p className="mt-1 text-slate-500 max-w-xs mx-auto">
      There are no shipping manifests matching your current filter.
    </p>
    <Button variant="outline" className="mt-6 rounded-xl" onClick={onReset}>
      Clear all filters
    </Button>
  </div>
);

export const ActiveFilterPill = ({
  status,
  onClear,
}: {
  status: ShippingManifestListStatus;
  onClear: () => void;
}) => (
  <div className="flex items-center gap-2 mb-6">
    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
      Active Filter:
    </span>
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold">
      Status: {formatLabel(status)}
      <button
        onClick={onClear}
        className="ml-1 hover:text-violet-900 transition-colors"
      >
        ×
      </button>
    </div>
  </div>
);

