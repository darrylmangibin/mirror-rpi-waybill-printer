import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Package,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TopNavbar } from "@/components/global/components/TopNavbar";
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
import { useShippingManifests } from "@/modules/ShippingManifest/hooks/useShippingManifests";
import { useCreateByShippingBinCode } from "@/modules/ShippingManifest/hooks/useCreateByShippingBinCode";
import type {
  ShippingManifest,
  ShippingManifestListStatus,
} from "@/modules/ShippingManifest/types/shipping-manifest.type";
import { ScannerLayout } from "../ScannerLayout";

type StatusFilter = ShippingManifestListStatus;

const statuses: StatusFilter[] = [
  "open",
  "closed",
  "for_loading",
  "loaded",
  "completed",
];

const perPageOptions = [10, 20, 50, 100];

const COLUMNS = 9;

type StatusConfig = {
  bg: string;
  text: string;
  border: string;
  dot: string;
};

const statusConfig: Record<StatusFilter, StatusConfig> = {
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

const formatLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (value: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    date: parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const DateCell = ({ value }: { value: string | null }) => {
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

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status as StatusFilter] ?? defaultStatusConfig;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
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

const SkeletonRows = ({ rows }: { rows: number }) =>
  Array.from({ length: rows }).map((_, i) => (
    <TableRow key={i} className="hover:bg-transparent">
      {Array.from({ length: COLUMNS }).map((_, j) => (
        <TableCell key={j} className="py-3.5">
          <Skeleton className={cn("h-4 rounded", j === 0 ? "w-28" : "w-20")} />
        </TableCell>
      ))}
    </TableRow>
  ));

const ShippingManifestList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("open");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [conflictManifest, setConflictManifest] =
    useState<ShippingManifest | null>(null);

  const { mutate: createShippingManifest, isPending: isCreating } =
    useCreateByShippingBinCode({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["shipping-manifests"] });
        toast.success("Shipping manifest created successfully");
        navigate(`/shipping-manifests/${data.id}`);
      },
      onError: (error) => {
        if (error.response?.status === 409) {
          const openManifest = error.response?.data?.error?.open_manifest;
          setConflictManifest(openManifest);
        } else {
          toast.error(
            error.response?.data?.error?.message ||
              "Failed to create shipping manifest",
          );
        }
      },
    });

  const params = useMemo(
    () => ({
      page,
      perPage,
      query: {
        where: { status: selectedStatus },
        orderBy: { created_at: "desc" },
      },
    }),
    [page, perPage, selectedStatus],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useShippingManifests(params);

  const manifests: ShippingManifest[] = data?.data ?? [];
  const currentPage = data?.meta.current_page ?? page;
  const totalPages = Math.max(data?.meta.last_page ?? 1, 1);
  const totalRows = data?.meta.total ?? 0;
  const fromRow = data?.meta.from ?? 0;
  const toRow = data?.meta.to ?? 0;

  const pageOptions = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => String(i + 1)),
    [totalPages],
  );

  const isFiltered = selectedStatus !== "open";

  return (
    <ScannerLayout
      onScan={(value) => createShippingManifest({ shippingBinCode: value })}
      isLoading={isCreating}
    >
      <TopNavbar />

      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* ── Page header ── */}
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
                  onValueChange={(v) => {
                    setSelectedStatus(v as StatusFilter);
                    setPage(1);
                  }}
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
                onValueChange={(v) => {
                  setPerPage(Number(v));
                  setPage(1);
                }}
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

          {/* ── Active filter pill (shown when not on the default "open" view) ── */}
          {isFiltered && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-slate-500">Filtered by:</span>
              <span
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 hover:bg-violet-200"
                onClick={() => {
                  setSelectedStatus("open");
                  setPage(1);
                }}
              >
                {formatLabel(selectedStatus)}
                <span className="text-violet-400">×</span>
              </span>
            </div>
          )}

          {/* ── Table card ── */}
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-opacity duration-200",
              isFetching && !isLoading && "opacity-60",
            )}
          >
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
                  <TableHead className="pl-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Manifest Code
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Carrier
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Receiver
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Plate No.
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Orders
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Generation
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </TableHead>
                  <TableHead className="pr-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Loaded
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <SkeletonRows rows={perPage} />
                ) : isError ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={COLUMNS}>
                      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                          <AlertCircle className="h-6 w-6 text-rose-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Failed to load manifests
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            An error occurred while fetching data.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => refetch()}
                          className="mt-1"
                        >
                          Try again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : manifests.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={COLUMNS}>
                      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <FileText className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            No manifests found
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {isFiltered
                              ? "Try removing the status filter."
                              : "No shipping manifests exist yet."}
                          </p>
                        </div>
                        {isFiltered && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStatus("open");
                              setPage(1);
                            }}
                            className="mt-1"
                          >
                            Clear filter
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  manifests.map((manifest, idx) => (
                    <TableRow
                      key={manifest.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(`/shipping-manifests/${manifest.id}`)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(`/shipping-manifests/${manifest.id}`);
                        }
                      }}
                      className={cn(
                        "cursor-pointer border-b border-slate-100 transition-all duration-150 hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 focus-visible:ring-inset",
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/30",
                      )}
                    >
                      <TableCell className="pl-5 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-sm font-semibold text-violet-700">
                            {manifest.manifest_code}
                          </span>
                          <span className="text-xs text-slate-400">
                            View details
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 text-sm text-slate-700">
                        {manifest.shipping_carrier ?? (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5 text-sm text-slate-700">
                        {manifest.receiver_name ?? (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5">
                        {manifest.vehicle_plate_number ? (
                          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700">
                            {manifest.vehicle_plate_number}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="inline-flex h-6 min-w-[2rem] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-700">
                          {manifest.loaded_orders_count ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                            manifest.generation_type === "automatic"
                              ? "border-violet-200 bg-violet-50 text-violet-700"
                              : "border-slate-200 bg-slate-50 text-slate-600",
                          )}
                        >
                          {formatLabel(manifest.generation_type)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <StatusBadge status={manifest.status} />
                      </TableCell>
                      <TableCell className="py-3.5">
                        <DateCell value={manifest.created_at} />
                      </TableCell>
                      <TableCell className="pr-5 py-3.5">
                        <DateCell value={manifest.loaded_at} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* ── Pagination footer ── */}
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                {isLoading ? (
                  <Skeleton className="h-3.5 w-40" />
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-medium text-slate-700">
                      {fromRow}
                    </span>
                    {" – "}
                    <span className="font-medium text-slate-700">{toRow}</span>
                    {" of "}
                    <span className="font-medium text-slate-700">
                      {totalRows.toLocaleString()}
                    </span>{" "}
                    results
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Previous */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-slate-200 shadow-xs hover:bg-slate-50"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1 || isFetching}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page select */}
                <Select
                  value={String(currentPage)}
                  onValueChange={(v) => setPage(Number(v))}
                >
                  <SelectTrigger className="h-8 w-[116px] rounded-lg border-slate-200 bg-white text-xs shadow-xs">
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
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages || isFetching}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Resolution Modal */}
      <Dialog
        open={!!conflictManifest}
        onOpenChange={(open) => !open && setConflictManifest(null)}
      >
        <DialogContent className="max-w-md gap-0 p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          <div className="bg-amber-50 px-6 py-8 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm mb-4">
              <AlertTriangle className="h-7 w-7 text-amber-500" />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-bold text-slate-900">
                Open Manifest Exists
              </DialogTitle>
              <DialogDescription className="text-slate-600 leading-relaxed">
                There is already an open shipping manifest for this collection.
                What would you like to do?
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="bg-white p-6 space-y-3">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-2 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Existing Code
                </span>
                <span className="font-mono text-sm font-bold text-violet-700">
                  {conflictManifest?.manifest_code}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Status
                </span>
                <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  Open
                </span>
              </div>
            </div>

            <Button
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.98]"
              onClick={() => {
                if (conflictManifest) {
                  navigate(`/shipping-manifests/${conflictManifest.id}`);
                }
                setConflictManifest(null);
              }}
            >
              Use Existing Manifest
            </Button>

            <Button
              variant="outline"
              className="w-full h-11 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
              onClick={() => {
                console.log(
                  "Action: Close and Create New for",
                  conflictManifest?.id,
                );
                setConflictManifest(null);
              }}
            >
              Close and Create New
            </Button>

            <Button
              variant="ghost"
              className="w-full h-10 text-slate-400 text-sm hover:text-slate-600 transition-all"
              onClick={() => setConflictManifest(null)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ScannerLayout>
  );
};

export default ShippingManifestList;
