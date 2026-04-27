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

import { ArrowLeft, CalendarDays, FileText, Route, Truck } from "lucide-react";
import { useAddItem } from "@/modules/ShippingManifest/hooks/useAddItem";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/loaders";
import { useQueryClient } from "@tanstack/react-query";
import { SHIPPING_BIN_ITEMS_QUERY_KEY } from "@/modules/ShippingBinItem/constants/shipping-bin-item.constant";

const ShippingManifestDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const queryClient = useQueryClient();

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

  const { mutate: addItemToManifest, isPending: isAddingItem } = useAddItem({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SHIPPING_BIN_ITEMS_QUERY_KEY],
      });
      toast.success("Item added to manifest");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message ||
          "Failed to add item to manifest",
      );
    },
  });

  const manifest = shippingManifest;

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
