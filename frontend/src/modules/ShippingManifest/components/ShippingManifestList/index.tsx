import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react";
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
import { OpenManifestConflictModal } from "../OpenManifestConflictModal";
import { ShippingManifestListHeader } from "../ShippingManifestListHeader";
import { formatDate, formatLabel } from "../../utils/shipping-manifest.util";
import { useCloseAndCreate } from "@/modules/ShippingManifest/hooks/useCloseAndCreate";
import { SHIPPING_MANIFESTS_QUERY_KEY } from "@/modules/ShippingManifest/constants/shipping-manifest.constant";

type StatusFilter = ShippingManifestListStatus;

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

const StatusBadge = ({ status }: { status: ShippingManifestListStatus }) => {
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

const TableSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border rounded-xl">
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);

const EmptyState = ({ onReset }: { onReset: () => void }) => (
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

const ShippingManifestList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("open");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [shippingBinCode, setShippingBinCode] = useState("");
  const [conflictManifest, setConflictManifest] =
    useState<ShippingManifest | null>(null);

  const { mutate: createShippingManifest, isPending: isCreating } =
    useCreateByShippingBinCode({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [SHIPPING_MANIFESTS_QUERY_KEY],
        });
        setShippingBinCode("");
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

  const { mutate: closeAndCreate, isPending: isClosingAndCreating } =
    useCloseAndCreate({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [SHIPPING_MANIFESTS_QUERY_KEY],
        });
        toast.success("Shipping manifest closed and created successfully");
        navigate(`/shipping-manifests/${data.id}`);
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.error?.message ||
            "Failed to close and create shipping manifest",
        );
      },
      onSettled: () => {
        setShippingBinCode("");
        setConflictManifest(null);
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

  const { data, isLoading, isFetching, refetch } = useShippingManifests(params);

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
      onScan={(value) => {
        if (isCreating || isClosingAndCreating) return;
        setShippingBinCode(value);
        createShippingManifest({ shippingBinCode: value });
      }}
      isLoading={isCreating || isClosingAndCreating}
    >
      {(isCreating || isClosingAndCreating) && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-white/40">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
            <p className="text-sm font-medium text-slate-600 tracking-tight">
              Creating manifest...
            </p>
          </div>
        </div>
      )}
      <TopNavbar />

      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <ShippingManifestListHeader
            totalRows={totalRows}
            isLoading={isLoading}
            isFetching={isFetching}
            selectedStatus={selectedStatus}
            onStatusChange={(v) => {
              setSelectedStatus(v);
              setPage(1);
            }}
            perPage={perPage}
            onPerPageChange={(v) => {
              setPerPage(v);
              setPage(1);
            }}
            onRefresh={() => refetch()}
          />

          {/* ── Active filter pill (shown when not on the default "open" view) ── */}
          {isFiltered && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Filter:
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold">
                Status: {formatLabel(selectedStatus)}
                <button
                  onClick={() => setSelectedStatus("open")}
                  className="ml-1 hover:text-violet-900 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* ── Content ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-6">
                <TableSkeleton />
              </div>
            ) : manifests.length === 0 ? (
              <div className="p-12">
                <EmptyState onReset={() => setSelectedStatus("open")} />
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
                        onClick={() =>
                          navigate(`/shipping-manifests/${manifest.id}`)
                        }
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
                Showing{" "}
                <span className="font-bold text-slate-700">{fromRow}</span> to{" "}
                <span className="font-bold text-slate-700">{toRow}</span> of{" "}
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

      <OpenManifestConflictModal
        manifest={conflictManifest}
        onClose={() => setConflictManifest(null)}
        onUseExisting={(manifest) => {
          navigate(`/shipping-manifests/${manifest.id}`);
          setConflictManifest(null);
        }}
        onCloseAndCreateNew={() => {
          closeAndCreate({
            shippingBinCode: shippingBinCode,
          });
          setConflictManifest(null);
        }}
        isLoading={isClosingAndCreating || isCreating}
      />
    </ScannerLayout>
  );
};

export default ShippingManifestList;
