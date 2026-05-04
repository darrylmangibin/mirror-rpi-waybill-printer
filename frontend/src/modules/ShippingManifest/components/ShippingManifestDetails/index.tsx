import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopNavbar } from "@/components/global/components/TopNavbar";
import { Button } from "@/components/ui/button";
import ShippingBinItemsList from "@/modules/ShippingBinItem/components/ShippingBinItemsList";
import { useShippingManifestById } from "@/modules/ShippingManifest/hooks/useShippingManifests";
import { formatLabel } from "@/modules/ShippingManifest/utils/shipping-manifest.util";
import { ScannerLayout } from "../ScannerLayout";
import { StatusBadge } from "../StatusBadge";
import { DetailField } from "./components/DetailField";
import { DateField } from "./components/DateField";
import { SectionCard } from "./components/SectionCard";
import { MetadataCard } from "./components/MetadataCard";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { CloseManifestModal } from "./components/CloseManifestModal";
import { ManualAddScannedItemModal } from "./components/ManualAddScannedItemModal";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
  PackageSearch,
  Route,
  Truck,
  XCircle,
} from "lucide-react";
import { useAddItem } from "@/modules/ShippingManifest/hooks/useAddItem";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/loaders";
import { useQueryClient } from "@tanstack/react-query";
import { SHIPPING_BIN_ITEMS_QUERY_KEY } from "@/modules/ShippingBinItem/constants/shipping-bin-item.constant";
import { useCloseManifest } from "@/modules/ShippingManifest/hooks/useCloseManifest";
import { SHIPPING_MANIFEST_QUERY_KEY } from "@/modules/ShippingManifest/constants/shipping-manifest.constant";
import { useSyncBinItem } from "@/modules/ShippingBinItem/hooks/useSyncBinItem";
import { useTenantConfigurations } from "@/modules/TenantConfiguration/hooks/useTenantConfigurations";
import { useCreateByTrackingNumber } from "@/modules/ShippingManifest/hooks/useCreateByTrackingNumber";
import { useGetShippingBins } from "@/modules/ShippingBin/hooks/useGetShippingBins";
import { cn } from "@/lib/utils";

type ManifestDetailsTab = "items" | "queue-jobs";

type QueueJobState =
  | "active"
  | "waiting"
  | "completed"
  | "failed"
  | "delayed"
  | "paused";

type QueueJobTenantResult = {
  tenant_id: string;
  invoice_numbers: string[];
};

type ManifestQueueJob = {
  job_id: string;
  manifest_id: string;
  state: QueueJobState;
  progress: number;
  result: {
    success_tenants: QueueJobTenantResult[];
    failure_tenants: QueueJobTenantResult[];
  };
  created_at: number;
};

type TenantResultGroup = QueueJobTenantResult & {
  job_ids: string[];
};

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
    description: "Background job progress and tenant-level results.",
  },
];

const queueJobStateConfig: Record<
  QueueJobState,
  { bg: string; text: string; border: string; dot: string }
> = {
  active: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  waiting: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  failed: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-400",
  },
  delayed: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  paused: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-400",
  },
};

const mockQueueJobs: ManifestQueueJob[] = [
  {
    job_id: "dae4297d-0438-4c75-9925-2bb6bc07240f",
    manifest_id: "726959d7-b1cd-452b-814c-e79849b21cba",
    state: "completed",
    progress: 1,
    result: {
      success_tenants: [
        {
          tenant_id: "staging-v2",
          invoice_numbers: ["260410F86MVW0X"],
        },
        {
          tenant_id: "staging-v2",
          invoice_numbers: ["260410N9K7ZH2Q"],
        },
      ],
      failure_tenants: [
        {
          tenant_id: "demo-tenant",
          invoice_numbers: ["260410FAILED01"],
        },
      ],
    },
    created_at: 1777868633575,
  },
];

const formatCreatedAt = (value: number) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const QueueJobStateBadge = ({ state }: { state: QueueJobState }) => {
  const cfg = queueJobStateConfig[state];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        cfg.bg,
        cfg.text,
        cfg.border
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {formatLabel(state)}
    </span>
  );
};

const groupTenantResults = (
  jobs: ManifestQueueJob[],
  resultKey: "success_tenants" | "failure_tenants"
) => {
  const groups = new Map<string, TenantResultGroup>();

  jobs.forEach((job) => {
    job.result[resultKey].forEach((tenantResult) => {
      const existing = groups.get(tenantResult.tenant_id);

      if (existing) {
        existing.invoice_numbers.push(...tenantResult.invoice_numbers);
        existing.job_ids.push(job.job_id);
        return;
      }

      groups.set(tenantResult.tenant_id, {
        tenant_id: tenantResult.tenant_id,
        invoice_numbers: [...tenantResult.invoice_numbers],
        job_ids: [job.job_id],
      });
    });
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    invoice_numbers: Array.from(new Set(group.invoice_numbers)),
    job_ids: Array.from(new Set(group.job_ids)),
  }));
};

const TenantResultGroups = ({
  title,
  description,
  icon: Icon,
  groups,
  variant,
}: {
  title: string;
  description: string;
  icon: typeof CheckCircle2;
  groups: TenantResultGroup[];
  variant: "success" | "failure";
}) => {
  const isSuccess = variant === "success";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            isSuccess
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No {isSuccess ? "successful" : "failed"} tenant results yet.
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.tenant_id}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-mono text-sm font-semibold text-slate-800">
                  {group.tenant_id}
                </p>
                <span className="text-xs text-slate-500">
                  {group.invoice_numbers.length} invoice
                  {group.invoice_numbers.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {group.invoice_numbers.map((invoiceNumber) => (
                  <span
                    key={invoiceNumber}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs font-medium text-slate-600"
                  >
                    {invoiceNumber}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const QueueJobsPanel = ({ jobs }: { jobs: ManifestQueueJob[] }) => {
  const successTenantGroups = useMemo(
    () => groupTenantResults(jobs, "success_tenants"),
    [jobs]
  );
  const failureTenantGroups = useMemo(
    () => groupTenantResults(jobs, "failure_tenants"),
    [jobs]
  );
  const totalInvoiceResults =
    successTenantGroups.reduce(
      (total, group) => total + group.invoice_numbers.length,
      0
    ) +
    failureTenantGroups.reduce(
      (total, group) => total + group.invoice_numbers.length,
      0
    );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Queue jobs
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {jobs.length.toLocaleString()} job{jobs.length !== 1 ? "s" : ""}{" "}
              with {totalInvoiceResults.toLocaleString()} invoice result
              {totalInvoiceResults !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          UI preview data
        </span>
      </div>

      <div className="space-y-5 p-5">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
            <Clock3 className="h-8 w-8 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">
                No queue jobs found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Queue job data will appear here after the API is connected.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <TenantResultGroups
                title="Success tenants"
                description="Invoices grouped by tenant from successful job results."
                icon={CheckCircle2}
                groups={successTenantGroups}
                variant="success"
              />
              <TenantResultGroups
                title="Failure tenants"
                description="Invoices grouped by tenant from failed job results."
                icon={XCircle}
                groups={failureTenantGroups}
                variant="failure"
              />
            </div>

            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.job_id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm font-semibold text-slate-800">
                          {job.job_id}
                        </p>
                        <QueueJobStateBadge state={job.state} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Created {formatCreatedAt(job.created_at)}
                      </p>
                    </div>
                    <div className="min-w-[180px]">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Progress</span>
                        <span className="font-medium text-slate-700">
                          {Math.round(job.progress * 100)}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900"
                          style={{
                            width: `${Math.min(Math.max(job.progress, 0), 1) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

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

              <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                <div className="space-y-6">
                  <SectionCard
                    icon={Truck}
                    title="Logistics information"
                    description="Operational details for receiving, loading, and delivery."
                  >
                    <DetailField
                      label="Carrier"
                      value={manifest.shipping_carrier}
                    />
                    <DetailField
                      label="Manifest Path"
                      value={manifest.manifest_path}
                      mono
                    />
                    <DetailField
                      label="Receiver Name"
                      value={manifest.receiver_name}
                    />
                    <DetailField
                      label="Vehicle Plate Number"
                      value={manifest.vehicle_plate_number}
                      mono
                    />
                    <DateField
                      label="Loading Started"
                      value={manifest.loading_started_at}
                    />
                    <DateField label="Loaded At" value={manifest.loaded_at} />
                    <DateField
                      label="Delivery Completed"
                      value={manifest.delivery_completed_at}
                    />
                    <DetailField
                      label="Tenant ID"
                      value={manifest.tenant_id}
                      mono
                    />
                  </SectionCard>

                  <MetadataCard manifest={manifest} />
                </div>

                <div className="space-y-6">
                  <SectionCard
                    icon={FileText}
                    title="Manifest overview"
                    description="Core manifest identifiers and generation metadata."
                  >
                    <DetailField label="Manifest ID" value={manifest.id} mono />
                    <DetailField
                      label="Manifest Code"
                      value={manifest.manifest_code}
                      mono
                    />
                    <DetailField
                      label="Status"
                      value={formatLabel(manifest.status)}
                    />
                    <DetailField
                      label="Generation Type"
                      value={formatLabel(manifest.generation_type)}
                    />
                    <DetailField
                      label="Generated By ID"
                      value={manifest.generated_by_id}
                      mono
                    />
                    <DetailField
                      label="Generated By Username"
                      value={manifest.generated_by_username}
                    />
                  </SectionCard>

                  <SectionCard
                    icon={CalendarDays}
                    title="Timeline"
                    description="Audit timestamps from creation through latest update."
                  >
                    <DateField label="Created At" value={manifest.created_at} />
                    <DateField label="Updated At" value={manifest.updated_at} />
                    <DateField label="Loaded At" value={manifest.loaded_at} />
                    <DateField
                      label="Delivery Completed"
                      value={manifest.delivery_completed_at}
                    />
                  </SectionCard>

                  <SectionCard
                    icon={Route}
                    title="Operational summary"
                    description="At-a-glance shipping and execution context."
                  >
                    <DetailField
                      label="Current Status"
                      value={formatLabel(manifest.status)}
                    />
                    <DetailField
                      label="Orders in Manifest"
                      value={manifest.loaded_orders_count ?? 0}
                    />
                    <DetailField
                      label="Manifest Path Available"
                      value={manifest.manifest_path ? "Yes" : "No"}
                    />
                    <DetailField
                      label="Metadata Available"
                      value={manifest.meta_data ? "Yes" : "No"}
                    />
                  </SectionCard>
                </div>
              </div>
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
                <QueueJobsPanel jobs={mockQueueJobs} />
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
