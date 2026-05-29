import { useMemo } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DateCell } from "@/modules/ShippingBinItem/components/ShippingBinItemsList/components/DateCell";
import { WorkflowBadge } from "@/modules/ShippingBinItem/components/ShippingBinItemsList/components/StatusBadges";
import { perPageOptions } from "@/modules/ShippingBinItem/components/ShippingBinItemsList/constants";
import type { MatchingItemsTableProps } from "../types";
import {
  RAW_ITEM_TABLE_COLUMNS,
  RawItemLoadingRows,
} from "./RawItemLoadingRows";

export const MatchingItemsTable = ({
  items,
  isLoading,
  isFetching,
  isError,
  page,
  perPage,
  totalRows,
  currentPage,
  totalPages,
  onPageChange,
  onPerPageChange,
  onRefresh,
}: MatchingItemsTableProps) => {
  const pageOptions = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => String(index + 1)),
    [totalPages],
  );

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <PackageSearch className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Matching shipping bin items
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isLoading
                ? "Loading raw items for the selected filters..."
                : `${totalRows.toLocaleString()} item${
                    totalRows !== 1 ? "s" : ""
                  } match the current analytics filters`}
            </p>
            {isFetching && !isLoading && (
              <p className="mt-1 text-xs font-medium text-violet-600">
                Updating table results...
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(perPage)}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-9 w-[110px] rounded-lg border-slate-200 bg-white text-sm shadow-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perPageOptions.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-slate-200 bg-white shadow-xs"
            onClick={onRefresh}
            disabled={isFetching}
            title="Refresh matching items"
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

      <div
        className={cn(
          isFetching && !isLoading && "opacity-70 transition-opacity",
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="pl-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Invoice number
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tracking number
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tenant
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Courier
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Marketplace
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Workflow
              </TableHead>
              <TableHead className="pr-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Shipped out
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <RawItemLoadingRows rows={perPage} />
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={RAW_ITEM_TABLE_COLUMNS}>
                  <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                      <AlertCircle className="h-6 w-6 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Failed to load matching shipping bin items
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Please try refreshing the raw item list.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onRefresh}>
                      Try again
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={RAW_ITEM_TABLE_COLUMNS}>
                  <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <PackageSearch className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        No matching shipping bin items found
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        No raw items matched the selected analytics filters.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "border-b border-slate-100 transition-colors hover:bg-slate-50/70",
                    index % 2 === 0 ? "bg-white" : "bg-slate-50/30",
                  )}
                >
                  <TableCell className="pl-5 py-3.5 align-top">
                    <DateCell
                      value={item.meta_data?.invoice_order?.created_at ?? null}
                    />
                  </TableCell>
                  <TableCell className="py-3.5 align-top">
                    <span className="font-mono text-sm font-semibold text-slate-800">
                      {item.invoice_number || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 align-top">
                    <span className="font-mono text-sm font-medium text-slate-600">
                      {item.tracking_number || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 align-top">
                    <span className="font-mono text-xs font-medium text-slate-600">
                      {item.tenant_id || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-slate-700">
                        {item.courier || "—"}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-slate-400">
                        {item.courier_code || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-slate-700">
                        {item.marketplace || "—"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.platform_slug || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 align-top">
                    <WorkflowBadge status={item.workflow_step} />
                  </TableCell>
                  <TableCell className="pr-5 py-3.5 align-top">
                    <DateCell value={item.shipped_out_at} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          {isLoading ? (
            <Skeleton className="h-3.5 w-44" />
          ) : (
            <>
              <span className="font-medium text-slate-700">
                {totalRows.toLocaleString()}
              </span>{" "}
              matching items
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-slate-200 shadow-xs hover:bg-slate-50"
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            disabled={currentPage <= 1 || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select
            value={String(currentPage)}
            onValueChange={(value) => onPageChange(Number(value))}
            disabled={isFetching}
          >
            <SelectTrigger className="h-8 w-auto rounded-lg border-slate-200 bg-white text-xs shadow-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageOptions.map((value) => (
                <SelectItem key={value} value={value} className="text-xs">
                  Page {value} of {totalPages}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-slate-200 shadow-xs hover:bg-slate-50"
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
            disabled={currentPage >= totalPages || isFetching}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
