import type { ComponentType, ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  FileCode2,
  FileText,
  Route,
  Truck,
} from "lucide-react";
import { TopNavbar } from "@/components/global/components/TopNavbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useShippingManifestById } from "@/modules/ShippingManifest/hooks/useShippingManifests";
import type {
  ShippingManifest,
  ShippingManifestStatus,
} from "@/modules/ShippingManifest/types/shipping-manifest.type";
import { useNavigate, useParams } from "react-router-dom";
import ShippingBinItemsList from "@/modules/ShippingBinItem/components/ShippingBinItemsList";
import { ScannerLayout } from "../ScannerLayout";

type StatusConfig = {
  bg: string;
  text: string;
  border: string;
  dot: string;
};

const statusConfig: Partial<Record<ShippingManifestStatus, StatusConfig>> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  processing: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  sweeping: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    dot: "bg-cyan-400",
  },
  staging: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    dot: "bg-indigo-400",
  },
  for_delivery: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-400",
  },
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
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

const formatDateTime = (value: string | null) => {
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

const StatusBadge = ({ status }: { status: ShippingManifestStatus }) => {
  const cfg = statusConfig[status] ?? defaultStatusConfig;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
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

const DetailField = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number | null;
  mono?: boolean;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p
      className={cn(
        "mt-1 break-words text-sm font-medium text-slate-700",
        mono && "font-mono text-[13px]",
      )}
    >
      {value ?? <span className="text-slate-400">—</span>}
    </p>
  </div>
);

const DateField = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) => {
  const formatted = formatDateTime(value);

  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      {formatted ? (
        <div className="mt-1 flex flex-col gap-0.5">
          <span className="text-sm font-medium text-slate-700">
            {formatted.date}
          </span>
          <span className="text-xs text-slate-400">{formatted.time}</span>
        </div>
      ) : (
        <p className="mt-1 text-sm font-medium text-slate-400">—</p>
      )}
    </div>
  );
};

const SectionCard = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
    <div className="grid gap-3 p-5 sm:grid-cols-2">{children}</div>
  </section>
);

const MetadataCard = ({ manifest }: { manifest: ShippingManifest }) => {
  const metadata = manifest.meta_data
    ? JSON.stringify(manifest.meta_data, null, 2)
    : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <FileCode2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Metadata</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Raw manifest metadata returned by the API.
          </p>
        </div>
      </div>
      <div className="p-5">
        {metadata ? (
          <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {metadata}
          </pre>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            No metadata available for this manifest.
          </div>
        )}
      </div>
    </section>
  );
};

const LoadingState = () => (
  <div className="space-y-6">
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="mt-3 h-9 w-64" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-4 h-48 rounded-xl" />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ErrorState = ({ onBack }: { onBack: () => void }) => (
  <div className="rounded-2xl border border-rose-200 bg-white px-6 py-10 text-center shadow-sm">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
      <AlertCircle className="h-6 w-6 text-rose-500" />
    </div>
    <h2 className="mt-4 text-lg font-semibold text-slate-900">
      Manifest not available
    </h2>
    <p className="mt-2 text-sm text-slate-500">
      The shipping manifest could not be loaded or may no longer exist.
    </p>
    <Button className="mt-5" variant="outline" onClick={onBack}>
      Back to manifests
    </Button>
  </div>
);

const ShippingManifestDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: shippingManifest,
    isLoading,
    isError,
  } = useShippingManifestById(
    { id: id || "" },
    {
      enabled: !!id,
    },
  );

  const manifest = shippingManifest;

  return (
    <ScannerLayout onScan={(value) => console.log("Details Page Scan Captured:", value)}>
      <TopNavbar />
      <div className="min-h-screen bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-center">
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
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-violet-800 px-6 py-6 text-white">
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
        {/* Shipping Bin Items List */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {manifest && (
            <ShippingBinItemsList shippingManifestId={manifest.id} />
          )}
        </div>
      </div>
    </ScannerLayout>
  );
};

export default ShippingManifestDetails;
