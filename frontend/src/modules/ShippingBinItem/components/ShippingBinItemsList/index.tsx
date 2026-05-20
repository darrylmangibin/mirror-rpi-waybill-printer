import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Lock,
  PackageSearch,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useShippingBinItems } from "@/modules/ShippingBinItem/hooks/useShippingBinItems";
import { useTenantConfigurations } from "@/modules/TenantConfiguration/hooks/useTenantConfigurations";
import type {
  ShippingBinItem,
  ShippingBinItemSyncStatus,
} from "@/modules/ShippingBinItem/types/shipping-bin-item.type";
import { COLUMNS, perPageOptions, syncStatusOptions } from "./constants";
import { DateCell } from "./components/DateCell";
import { LoadingRows } from "./components/LoadingRows";
import {
  SyncStatusBadge,
  ValidationBadge,
  WorkflowBadge,
} from "./components/StatusBadges";
import { areSyncStatusesEqual, getSyncStatusFilterLabel } from "./utils";

export interface ShippingBinItemsListProps {
  shippingManifestId?: string;
  onCloseManifest?: () => void;
  onSyncItem?: (id: ShippingBinItem["id"]) => void;
}

const ShippingBinItemsList = ({
  shippingManifestId,
  onCloseManifest,
  onSyncItem,
}: ShippingBinItemsListProps) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedSyncStatus, setSelectedSyncStatus] = useState<
    ShippingBinItemSyncStatus[]
  >([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("all");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [lastSelectedItemId, setLastSelectedItemId] = useState<string | null>(
    null,
  );
  const isShiftSelectingRef = useRef(false);

  const { data: tenantConfigs } = useTenantConfigurations();

  const params = useMemo(() => {
    const where: Record<string, unknown> = {};

    if (shippingManifestId) {
      where.shipping_manifest_id = shippingManifestId;
    }

    if (selectedSyncStatus.length > 0) {
      where.sync_status = { in: selectedSyncStatus };
    }

    if (selectedTenantId !== "all") {
      where.tenant_id = selectedTenantId;
    }

    return {
      page,
      perPage,
      query: {
        where,
        orderBy: { updated_at: "desc" },
      },
    };
  }, [page, perPage, selectedSyncStatus, shippingManifestId, selectedTenantId]);

  const { data, isLoading, isFetching, error, refetch } = useShippingBinItems(
    params,
    {
      enabled: Boolean(shippingManifestId),
    },
  );

  const items: ShippingBinItem[] = useMemo(() => data?.data ?? [], [data?.data]);
  const currentPage = data?.meta.current_page ?? page;
  const totalPages = Math.max(data?.meta.last_page ?? 1, 1);
  const totalRows = data?.meta.total ?? 0;
  const pageOptions = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => String(index + 1)),
    [totalPages],
  );
  const visibleItemIds = useMemo(() => items.map((item) => item.id), [items]);
  const selectedVisibleItemCount = visibleItemIds.filter((id) =>
    selectedItemIds.has(id),
  ).length;
  const hasVisibleItems = visibleItemIds.length > 0;
  const areAllVisibleItemsSelected =
    hasVisibleItems && selectedVisibleItemCount === visibleItemIds.length;
  const areSomeVisibleItemsSelected =
    selectedVisibleItemCount > 0 && !areAllVisibleItemsSelected;
  const selectedCount = selectedItemIds.size;

  useEffect(() => {
    setSelectedItemIds((current) => (current.size === 0 ? current : new Set()));
    setLastSelectedItemId(null);
  }, [page, perPage, selectedSyncStatus, selectedTenantId, shippingManifestId]);

  useEffect(() => {
    const visibleItemIdSet = new Set(visibleItemIds);

    setSelectedItemIds((current) => {
      const next = new Set(
        Array.from(current).filter((id) => visibleItemIdSet.has(id)),
      );

      return next.size === current.size ? current : next;
    });
    setLastSelectedItemId((current) =>
      current && visibleItemIdSet.has(current) ? current : null,
    );
  }, [visibleItemIds]);

  const handleItemSelection = (
    item: ShippingBinItem,
    index: number,
    shouldSelect: boolean,
    isRangeSelection: boolean,
  ) => {
    setSelectedItemIds((current) => {
      const next = new Set(current);

      const anchorIndex = lastSelectedItemId
        ? items.findIndex((rangeItem) => rangeItem.id === lastSelectedItemId)
        : -1;

      if (isRangeSelection && anchorIndex !== -1) {
        const startIndex = Math.min(anchorIndex, index);
        const endIndex = Math.max(anchorIndex, index);
        const rangeItemIds = items
          .slice(startIndex, endIndex + 1)
          .map((rangeItem) => rangeItem.id);

        rangeItemIds.forEach((id) => {
          if (shouldSelect) {
            next.add(id);
          } else {
            next.delete(id);
          }
        });
      } else if (shouldSelect) {
        next.add(item.id);
      } else {
        next.delete(item.id);
      }

      return next;
    });
    setLastSelectedItemId(item.id);
  };

  const toggleVisibleItemsSelection = () => {
    setSelectedItemIds((current) => {
      const next = new Set(current);

      if (areAllVisibleItemsSelected) {
        visibleItemIds.forEach((id) => next.delete(id));
      } else {
        visibleItemIds.forEach((id) => next.add(id));
      }

      return next;
    });
    setLastSelectedItemId(null);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-6 flex-col">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <PackageSearch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Shipping bin items
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {isLoading
                  ? "Loading related shipping bin items..."
                  : `${totalRows.toLocaleString()} item${
                      totalRows !== 1 ? "s" : ""
                    } linked to this manifest`}
              </p>
              {selectedCount > 0 && (
                <p className="mt-1 text-xs font-medium text-violet-600">
                  {selectedCount.toLocaleString()} selected
                </p>
              )}
            </div>
          </div>
          {onCloseManifest && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              onClick={onCloseManifest}
            >
              <Lock className="h-3.5 w-3.5" />
              Close Manifest
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap items-center gap-2">
            {syncStatusOptions.map((option) => {
              const isActive = areSyncStatusesEqual(
                selectedSyncStatus,
                option.statuses,
              );
              return (
                <Button
                  key={option.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full border-slate-200 px-3",
                    isActive &&
                      "border-slate-900 bg-slate-900 text-white hover:bg-slate-800 hover:text-white",
                  )}
                  onClick={() => {
                    setSelectedSyncStatus(option.statuses);
                    setPage(1);
                  }}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <Select
              value={selectedTenantId}
              onValueChange={(value) => {
                setSelectedTenantId(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[180px] rounded-lg border-slate-200 bg-white text-sm shadow-xs">
                <SelectValue placeholder="All Tenants" />
              </SelectTrigger>
              <SelectContent className="h-96">
                <SelectItem value="all">All Tenants</SelectItem>
                {tenantConfigs?.map((config) => (
                  <SelectItem key={config.tenant_id} value={config.tenant_id}>
                    {config.system_name || config.tenant_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(perPage)}
              onValueChange={(value) => {
                setPerPage(Number(value));
                setPage(1);
              }}
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
              onClick={() => refetch()}
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
      </div>

      <div
        className={cn(
          isFetching && !isLoading && "opacity-70 transition-opacity",
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-12 pl-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Checkbox
                  checked={
                    areAllVisibleItemsSelected
                      ? true
                      : areSomeVisibleItemsSelected
                        ? "indeterminate"
                        : false
                  }
                  aria-label={
                    areAllVisibleItemsSelected
                      ? "Deselect all visible shipping bin items"
                      : "Select all visible shipping bin items"
                  }
                  disabled={!hasVisibleItems || isLoading}
                  className="border-slate-300 data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600 data-[state=indeterminate]:border-violet-600 data-[state=indeterminate]:bg-violet-600"
                  onCheckedChange={toggleVisibleItemsSelection}
                />
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Invoice / Tracking
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
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Validation
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sync status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Shipped out
              </TableHead>
              <TableHead className="pr-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!shippingManifestId ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUMNS}
                  className="h-28 text-center text-sm text-slate-500"
                >
                  Shipping manifest ID is required to load bin items.
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <LoadingRows rows={perPage} />
            ) : error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={COLUMNS}>
                  <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                      <AlertCircle className="h-6 w-6 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Failed to load shipping bin items
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Please try refreshing the list.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                    >
                      Try again
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={COLUMNS}>
                  <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <PackageSearch className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        No shipping bin items found
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {selectedSyncStatus.length === 0
                          ? "No bin items are linked to this shipping manifest yet."
                          : `No items matched the ${getSyncStatusFilterLabel(
                              selectedSyncStatus,
                            )} sync status.`}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => {
                const isSelected = selectedItemIds.has(item.id);

                return (
                  <TableRow
                    key={item.id}
                    aria-selected={isSelected}
                    className={cn(
                      "border-b border-slate-100 transition-colors hover:bg-slate-50/70",
                      isSelected
                        ? "bg-violet-50/70 hover:bg-violet-50"
                        : index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50/30",
                    )}
                  >
                    <TableCell className="pl-5 py-3.5 align-top">
                      <Checkbox
                        checked={isSelected}
                        aria-label={`Select shipping bin item ${item.invoice_number}`}
                        className="border-slate-300 data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600"
                        onClick={(event) => {
                          isShiftSelectingRef.current = event.shiftKey;
                        }}
                        onCheckedChange={(checked) => {
                          handleItemSelection(
                            item,
                            index,
                            checked === true,
                            isShiftSelectingRef.current,
                          );
                          isShiftSelectingRef.current = false;
                        }}
                      />
                    </TableCell>
                    <TableCell className="py-3.5 align-top">
                      <div className="flex min-w-[200px] flex-col gap-1">
                        <span className="font-mono text-sm font-semibold text-slate-800">
                          {item.invoice_number}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {item.tracking_number || "—"}
                        </span>
                      </div>
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
                    <TableCell className="py-3.5 align-top">
                      <ValidationBadge status={item.validation_status} />
                    </TableCell>
                    <TableCell className="py-3.5 align-top">
                      <SyncStatusBadge status={item.sync_status} />
                    </TableCell>
                    <TableCell className="py-3.5 align-top">
                      <DateCell value={item.shipped_out_at} />
                    </TableCell>
                    <TableCell className="pr-5 py-3.5 align-top">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-w-[88px] rounded-lg border-slate-200"
                        onClick={() => onSyncItem?.(item.id)}
                        disabled={
                          !onSyncItem || item.sync_status !== "sync_failed"
                        }
                      >
                        Sync
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
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
              items
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-slate-200 shadow-xs hover:bg-slate-50"
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            disabled={currentPage <= 1 || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select
            value={String(currentPage)}
            onValueChange={(value) => setPage(Number(value))}
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
            onClick={() =>
              setPage((current) => Math.min(current + 1, totalPages))
            }
            disabled={currentPage >= totalPages || isFetching}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ShippingBinItemsList;
