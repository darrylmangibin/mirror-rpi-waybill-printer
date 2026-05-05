import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopNavbar } from "@/components/global/components/TopNavbar";
import { Button } from "@/components/ui/button";
import ShippingBinItemsList from "@/modules/ShippingBinItem/components/ShippingBinItemsList";
import { useShippingManifestById } from "@/modules/ShippingManifest/hooks/useShippingManifests";
import { formatLabel } from "@/modules/ShippingManifest/utils/shipping-manifest.util";
import { ScannerLayout } from "../ScannerLayout";
import { StatusBadge } from "../StatusBadge";
import { DetailField } from "./components/DetailField";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { CloseManifestModal } from "./components/CloseManifestModal";
import { ManualAddScannedItemModal } from "./components/ManualAddScannedItemModal";

import { ArrowLeft, ListChecks, PackageSearch } from "lucide-react";
import { useAddItem } from "@/modules/ShippingManifest/hooks/useAddItem";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/loaders";
import { useQueryClient } from "@tanstack/react-query";
import { SHIPPING_BIN_ITEMS_QUERY_KEY } from "@/modules/ShippingBinItem/constants/shipping-bin-item.constant";
import { useCloseManifest } from "@/modules/ShippingManifest/hooks/useCloseManifest";
import {
  SHIPPING_MANIFEST_QUERY_KEY,
  SHIPPING_MANIFEST_STATUS_JOBS_QUERY_KEY,
} from "@/modules/ShippingManifest/constants/shipping-manifest.constant";
import { useSyncBinItem } from "@/modules/ShippingBinItem/hooks/useSyncBinItem";
import { useTenantConfigurations } from "@/modules/TenantConfiguration/hooks/useTenantConfigurations";
import { useCreateByTrackingNumber } from "@/modules/ShippingManifest/hooks/useCreateByTrackingNumber";
import { useGetShippingBins } from "@/modules/ShippingBin/hooks/useGetShippingBins";
import { cn } from "@/lib/utils";
import { useShippingManifestStatusJobs } from "@/modules/ShippingManifest/hooks/useShippingManifestStatusJobs";
import { QueueJobsPanel } from "./components/QueueJobsPanel";
import { useRetryShippingManifestJob } from "@/modules/ShippingManifest/hooks/useRetryShippingManifestJob";

type ManifestDetailsTab = "items" | "queue-jobs";

const tabOptions: Array<{
  value: ManifestDetailsTab;
  label: string;
  description: string;
}> = [
  {
    value: "items",
    label: "Shipping bin items",
    description: "Items currently linked to this manifest.",
  },
  {
    value: "queue-jobs",
    label: "Queue jobs",
    description: "Background job status and tenant-level results.",
  },
];

const ShippingManifestDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeDetailsTab, setActiveDetailsTab] =
    useState<ManifestDetailsTab>("items");
  const [openRegisterBinItemModal, setOpenRegisterBinItemModal] =
    useState(false);
  const [unregisteredTrackingNumber, setUnregisteredTrackingNumber] = useState<
    string | null
  >(null);

  const queryClient = useQueryClient();

  const {
    data: manifest,
    isLoading,
    isError,
  } = useShippingManifestById(
    { id: id || "" },
    {
      enabled: !!id,
    }
  );

  const { data: shippingBins } = useGetShippingBins(
    {
      query: {
        where: {
          category: "collection_hub",
          courier_code: manifest?.carrier_code || "",
        },
      },
    },
    {
      enabled: !!manifest?.carrier_code,
    }
  );

  const { data: queueJobs, isLoading: isLoadingQueueJobs } =
    useShippingManifestStatusJobs(manifest?.id || "", {
      enabled: activeDetailsTab === "queue-jobs" && !!manifest?.id,
    });

  const { data: tenantConfigurations } = useTenantConfigurations({});

  const { mutate: addItemToManifest, isPending: isAddingItem } = useAddItem({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SHIPPING_BIN_ITEMS_QUERY_KEY],
      });
      setUnregisteredTrackingNumber(null);
      toast.success("Item added to manifest");
    },
    onError: (error) => {
      if (error.status === 422) {
        toast.warning(
          error.response?.data?.error?.message ||
            "Item cannot be added to manifest. Please check the tracking number and try again."
        );
        // open openRegisterBinItemModal to allow user to register the bin item manually
        setUnregisteredTrackingNumber(
          error.response?.data.error?.tracking_number || null
        );
        setOpenRegisterBinItemModal(true);
        return;
      }

      toast.error(
        error.response?.data?.error?.message || "Failed to add item to manifest"
      );
    },
  });

  const { mutate: closeManifest, isPending: isClosingManifest } =
    useCloseManifest({
      onSuccess: (data) => {
        toast.success("Manifest closed successfully");
        setShowCloseConfirm(false);
        queryClient.invalidateQueries({
          queryKey: [SHIPPING_BIN_ITEMS_QUERY_KEY],
        });
        queryClient.invalidateQueries({
          queryKey: [SHIPPING_MANIFEST_QUERY_KEY, data.id],
        });
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.error?.message || "Failed to close manifest"
        );
      },
    });

  const { mutate: syncBinItem, isPending: isSyncingBinItem } = useSyncBinItem({
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [SHIPPING_BIN_ITEMS_QUERY_KEY],
      });

      if (data.data.sync_status === "sync_failed") {
        toast.error(
          `Failed to sync item: ${data.data.invoice_number} marketplace integration error`
        );
      } else {
        toast.success(`Item ${data.data.invoice_number} synced successfully`);
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to sync item"
      );
    },
  });

  const {
    mutate: createByTrackingNumber,
    isPending: isCreatingByTrackingNumber,
  } = useCreateByTrackingNumber({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SHIPPING_BIN_ITEMS_QUERY_KEY],
      });
      closeRegisterBinItemModal();
      toast.success("Item added successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to create item"
      );
    },
  });

  const {
    mutate: retryShippingManifestJob,
    isPending: isRetryingShippingManifestJob,
  } = useRetryShippingManifestJob({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SHIPPING_MANIFEST_STATUS_JOBS_QUERY_KEY, manifest?.id],
      });
      toast.success("Job retried successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to retry job"
      );
    },
  });

  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const closeRegisterBinItemModal = () => {
    setOpenRegisterBinItemModal(false);
    setUnregisteredTrackingNumber(null);
  };

  return (
    <ScannerLayout
      isDisabled={manifest?.status !== "open"}
      onScan={(value) => {
        addItemToManifest({
          shippingManifestId: manifest?.id || "",
          payload: { tracking_number: value },
        });
      }}
    >
      {isAddingItem && <LoadingOverlay message="Adding item to manifest..." />}
      {isSyncingBinItem && <LoadingOverlay message="Syncing bin item..." />}
      <TopNavbar />
      <div className="min-h-screen bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 bg-white"
              onClick={() => navigate("/shipping-manifests")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to manifests
            </Button>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : isError || !manifest ? (
            <ErrorState onBack={() => navigate("/shipping-manifests")} />
          ) : (
            <div className="space-y-6">
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-linear-to-r from-slate-900 via-slate-800 to-violet-800 px-6 py-6 text-white">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/65">
                        Shipping Manifest Details
                      </p>
                      <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                        {manifest.manifest_code}
                      </h1>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
                        <span>{manifest.shipping_carrier}</span>
                        <span className="h-1 w-1 rounded-full bg-white/40" />
                        <span>Tenant {manifest.tenant_id}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={manifest.status} />
                      <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white">
                        {formatLabel(manifest.generation_type)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 border-t border-slate-100 bg-white px-6 py-5 sm:grid-cols-2 xl:grid-cols-4">
                  <DetailField
                    label="Receiver"
                    value={manifest.receiver_name}
                  />
                  <DetailField
                    label="Vehicle Plate"
                    value={manifest.vehicle_plate_number}
                    mono
                  />
                  <DetailField
                    label="Loaded Orders"
                    value={manifest.loaded_orders_count ?? 0}
                  />
                  <DetailField
                    label="Generated By"
                    value={
                      manifest.generated_by_username ?? manifest.generated_by_id
                    }
                  />
                </div>
              </section>
            </div>
          )}
        </div>
        {/* Shipping Bin Items and Queue Jobs */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {manifest && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="grid gap-2 md:grid-cols-2">
                  {tabOptions.map((tab) => {
                    const isActive = activeDetailsTab === tab.value;

                    return (
                      <button
                        key={tab.value}
                        type="button"
                        className={cn(
                          "flex items-start gap-3 rounded-xl px-4 py-3 text-left transition-colors",
                          isActive
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                        onClick={() => setActiveDetailsTab(tab.value)}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg",
                            isActive
                              ? "bg-white/10 text-white"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {tab.value === "items" ? (
                            <PackageSearch className="h-4 w-4" />
                          ) : (
                            <ListChecks className="h-4 w-4" />
                          )}
                        </div>
                        <span>
                          <span className="block text-sm font-semibold">
                            {tab.label}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 block text-xs",
                              isActive ? "text-white/70" : "text-slate-400"
                            )}
                          >
                            {tab.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeDetailsTab === "items" ? (
                <ShippingBinItemsList
                  shippingManifestId={manifest.id}
                  onSyncItem={(shippingBinItemId) =>
                    syncBinItem({ shippingBinItemId })
                  }
                  onCloseManifest={
                    manifest.status === "open"
                      ? () => setShowCloseConfirm(true)
                      : undefined
                  }
                />
              ) : (
                <QueueJobsPanel
                  jobs={queueJobs ?? []}
                  isLoading={isLoadingQueueJobs}
                  isRetrying={isRetryingShippingManifestJob}
                  onRetryJob={(manifestId, jobId) => {
                    if (manifestId && jobId) {
                      retryShippingManifestJob({
                        shippingManifestId: manifestId,
                        jobId,
                      });
                    }
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <CloseManifestModal
        open={showCloseConfirm}
        isPending={isClosingManifest}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={() => manifest && closeManifest({ manifestId: manifest.id })}
      />
      <ManualAddScannedItemModal
        open={openRegisterBinItemModal}
        trackingNumber={unregisteredTrackingNumber}
        tenantConfigurations={tenantConfigurations}
        shippingBins={shippingBins?.data}
        isPending={isCreatingByTrackingNumber}
        onClose={closeRegisterBinItemModal}
        onConfirm={(tenantId, shippingBinCode) => {
          createByTrackingNumber({
            shippingManifestId: manifest?.id || "",
            payload: {
              trackingNumber: unregisteredTrackingNumber || "",
              tenantId,
              shippingBinCode,
            },
          });
        }}
      />
    </ScannerLayout>
  );
};

export default ShippingManifestDetails;
