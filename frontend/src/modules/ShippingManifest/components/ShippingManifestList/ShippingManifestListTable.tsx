import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ShippingManifest,
  ShippingManifestListStatus,
} from "@/modules/ShippingManifest/types/shipping-manifest.type";
import {
  DateCell,
  EmptyState,
  StatusBadge,
  TableSkeleton,
} from "./ShippingManifestListComponents";

interface ShippingManifestListTableProps {
  manifests: ShippingManifest[];
  isLoading: boolean;
  isFetching: boolean;
  onStatusReset: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRows: number;
  pageOptions: string[];
}

export const ShippingManifestListTable = ({
  manifests,
  isLoading,
  isFetching,
  onStatusReset,
  currentPage,
  totalPages,
  onPageChange,
  totalRows,
  pageOptions,
}: ShippingManifestListTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="p-6">
          <TableSkeleton />
        </div>
      ) : manifests.length === 0 ? (
        <div className="p-12">
          <EmptyState onReset={onStatusReset} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="w-[180px] text-xs font-bold uppercase tracking-wider text-slate-500 py-4">
                  Manifest Code
                </TableHead>
                <TableHead className="w-[180px] text-xs font-bold uppercase tracking-wider text-slate-500 py-4">
                  Carrier
                </TableHead>
                <TableHead className="w-[130px] text-xs font-bold uppercase tracking-wider text-slate-500 py-4 text-center">
                  Loaded Orders
                </TableHead>
                <TableHead className="w-[140px] text-xs font-bold uppercase tracking-wider text-slate-500 py-4 text-center">
                  Status
                </TableHead>
                <TableHead className="w-[140px] text-xs font-bold uppercase tracking-wider text-slate-500 py-4">
                  Generation
                </TableHead>
                <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider text-slate-500 py-4">
                  Started At
                </TableHead>
                <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider text-slate-500 py-4">
                  Loaded At
                </TableHead>
                <TableHead className="w-20 text-right py-4 pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manifests.map((manifest) => (
                <TableRow
                  key={manifest.id}
                  className="group hover:bg-slate-50/50 transition-colors border-slate-100 last:border-0 cursor-pointer"
                  onClick={() => navigate(`/shipping-manifests/${manifest.id}`)}
                >
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                        {manifest.manifest_code}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                        ID: {manifest.id.slice(0, 8)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-slate-700">
                        {manifest.shipping_carrier}
                      </span>
                      {manifest.carrier_code && (
                        <span className="inline-flex w-fit px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                          {manifest.carrier_code}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <div className="inline-flex flex-col items-center justify-center h-10 w-16 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-sm font-bold text-slate-900">
                        {manifest.loaded_orders_count ?? 0}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                        Orders
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-center">
                      <StatusBadge
                        status={
                          manifest.status as unknown as ShippingManifestListStatus
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-slate-600 capitalize">
                        {manifest.generation_type}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        by {manifest.generated_by_username || "System"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <DateCell value={manifest.loading_started_at} />
                  </TableCell>
                  <TableCell className="py-4">
                    <DateCell value={manifest.loaded_at} />
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-400 group-hover:text-violet-600 group-hover:bg-violet-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Pagination ── */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          <span className="font-bold text-slate-700">
            {totalRows.toLocaleString()}
          </span>{" "}
          records
        </div>

        <div className="flex items-center gap-1.5">
          {/* Prev */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-slate-200 shadow-xs hover:bg-slate-50"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1 || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page select */}
          <Select
            value={String(currentPage)}
            onValueChange={(v) => onPageChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-auto rounded-lg border-slate-200 bg-white text-xs shadow-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageOptions.map((v) => (
                <SelectItem key={v} value={v} className="text-xs">
                  Page {v} of {totalPages}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Next */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-slate-200 shadow-xs hover:bg-slate-50"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage >= totalPages || isFetching}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
