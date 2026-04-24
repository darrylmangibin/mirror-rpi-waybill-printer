import { Filter, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ShippingManifestListStatus } from "../../types/shipping-manifest.type";
import { formatLabel } from "../../utils/shipping-manifest.util";

interface ShippingManifestListHeaderProps {
  totalRows: number;
  isLoading: boolean;
  isFetching: boolean;
  selectedStatus: ShippingManifestListStatus;
  onStatusChange: (status: ShippingManifestListStatus) => void;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  onRefresh: () => void;
}

const statuses: ShippingManifestListStatus[] = [
  "open",
  "closed",
  "for_loading",
  "loaded",
  "completed",
];

const perPageOptions = [10, 20, 50, 100];

export const ShippingManifestListHeader = ({
  totalRows,
  isLoading,
  isFetching,
  selectedStatus,
  onStatusChange,
  perPage,
  onPerPageChange,
  onRefresh,
}: ShippingManifestListHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 shadow-sm">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 leading-tight">
            Shipping Manifests
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isLoading
              ? "Loading records…"
              : `${totalRows.toLocaleString()} record${totalRows !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 shadow-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <Select
            value={selectedStatus}
            onValueChange={(v) => onStatusChange(v as ShippingManifestListStatus)}
          >
            <SelectTrigger className="h-8 w-[170px] border-0 shadow-none focus:ring-0 text-sm">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Per-page */}
        <Select
          value={String(perPage)}
          onValueChange={(v) => onPerPageChange(Number(v))}
        >
          <SelectTrigger className="h-9 w-[110px] rounded-lg border-slate-200 bg-white text-sm shadow-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {perPageOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Refresh */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg border-slate-200 bg-white shadow-xs"
          onClick={onRefresh}
          disabled={isFetching}
          title="Refresh"
        >
          <RefreshCw
            className={cn(
              "h-4 w-4 text-slate-500",
              isFetching && "animate-spin",
            )}
          />
        </Button>
      </div>
    </div>
  );
};
