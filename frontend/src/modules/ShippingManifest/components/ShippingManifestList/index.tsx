import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/loaders";
import { useShippingManifests } from "@/modules/ShippingManifest/hooks/useShippingManifests";
import { useCreateByShippingBinCode } from "@/modules/ShippingManifest/hooks/useCreateByShippingBinCode";
import type {
  ShippingManifest,
  ShippingManifestListStatus,
} from "@/modules/ShippingManifest/types/shipping-manifest.type";
import { ScannerLayout } from "../ScannerLayout";
import { OpenManifestConflictModal } from "../OpenManifestConflictModal";
import { ShippingManifestListHeader } from "../ShippingManifestListHeader";
import { ActiveFilterPill } from "./ShippingManifestListComponents";
import { ShippingManifestListTable } from "./ShippingManifestListTable";
import { useCloseAndCreate } from "@/modules/ShippingManifest/hooks/useCloseAndCreate";
import { SHIPPING_MANIFESTS_QUERY_KEY } from "@/modules/ShippingManifest/constants/shipping-manifest.constant";

const DEFAULT_SELECTED_STATUS: ShippingManifestListStatus = "open";
const SELECTED_STATUS_QUERY_PARAM = "selected-status";
const listStatuses: ShippingManifestListStatus[] = [
  "open",
  "closed",
  "for_loading",
  "loaded",
  "completed",
];

const isShippingManifestListStatus = (
  value: string | null
): value is ShippingManifestListStatus =>
  value !== null && listStatuses.includes(value as ShippingManifestListStatus);

const ShippingManifestList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [shippingBinCode, setShippingBinCode] = useState("");
  const [conflictManifest, setConflictManifest] =
    useState<ShippingManifest | null>(null);

  const selectedStatusParam = searchParams.get(SELECTED_STATUS_QUERY_PARAM);
  const selectedStatus = isShippingManifestListStatus(selectedStatusParam)
    ? selectedStatusParam
    : DEFAULT_SELECTED_STATUS;

  useEffect(() => {
    if (selectedStatusParam === selectedStatus) return;

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set(SELECTED_STATUS_QUERY_PARAM, selectedStatus);
        return next;
      },
      { replace: true }
    );
  }, [selectedStatus, selectedStatusParam, setSearchParams]);

  const setSelectedStatus = (status: ShippingManifestListStatus) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set(SELECTED_STATUS_QUERY_PARAM, status);
      return next;
    });
  };

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
              "Failed to create shipping manifest"
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
            "Failed to close and create shipping manifest"
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
        where: { status: selectedStatus, tenant_id: null },
        orderBy: { created_at: "desc" },
      },
    }),
    [page, perPage, selectedStatus]
  );

  const { data, isLoading, isFetching, refetch } = useShippingManifests(params);

  const manifests: ShippingManifest[] = data?.data ?? [];
  const currentPage = data?.meta.current_page ?? page;
  const totalPages = Math.max(data?.meta.last_page ?? 1, 1);
  const totalRows = data?.meta.total ?? 0;

  const pageOptions = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => String(i + 1)),
    [totalPages]
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
        <LoadingOverlay message="Creating manifest..." />
      )}

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
            <ActiveFilterPill
              status={selectedStatus}
              onClear={() => setSelectedStatus("open")}
            />
          )}

          {/* ── Content ── */}
          <ShippingManifestListTable
            manifests={manifests}
            isLoading={isLoading}
            isFetching={isFetching}
            onStatusReset={() => setSelectedStatus("open")}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            totalRows={totalRows}
            pageOptions={pageOptions}
          />
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
