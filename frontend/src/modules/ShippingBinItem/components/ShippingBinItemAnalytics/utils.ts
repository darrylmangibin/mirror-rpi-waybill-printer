import { format } from "date-fns";
import type {
  ShippingBinItemAnalytics,
  ShippingBinItemAnalyticsParams,
  ShippingBinItemAnalyticsTotal,
  ShippingBinItemCurrentBinCategory,
  ShippingBinItemManifestStatusFilter,
  ShippingBinItemValidationStatus,
  ShippingBinItemWorkflowStep,
} from "@/modules/ShippingBinItem/types/shipping-bin-item.type";
import type { ChartDatum } from "./types";

export const ALL_OPTION = "all";

export const marketplaceOptions = [
  "tiktok",
  "shopee",
  "zalora",
  "lazada",
  "shopify",
];

export const validationStatusOptions: ShippingBinItemValidationStatus[] = [
  "pending",
  "verified_present",
  "missing_from_bin",
  "not_accepted_by_courier",
  "no_tracking_number",
];

export const workflowStepOptions: ShippingBinItemWorkflowStep[] = [
  "at_packing_station",
  "being_validated",
  "in_collection_bin",
  "shipped_out",
  "for_loading",
  "loaded",
  "not_accepted_by_courier",
];

export const manifestStatusOptions: ShippingBinItemManifestStatusFilter[] = [
  "with_manifest",
  "without_manifest",
  "courier_scan_completed",
  "courier_dispatch",
];

export const todayDate = () => format(new Date(), "yyyy-MM-dd");

export const formatLabel = (value: string | null | undefined) => {
  if (!value) return "Unassigned";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const parseDateOnly = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const getTotalItems = (
  total: ShippingBinItemAnalyticsTotal | undefined,
) => total?.total_items ?? total?.total ?? total?.count ?? 0;

export const toStartOfDayIso = (value: string) => `${value}T00:00:00.000Z`;

export const toEndOfDayIso = (value: string) => `${value}T23:59:59.999Z`;

export const getManifestStatusWhere = (
  status: ShippingBinItemManifestStatusFilter,
): Record<string, unknown> => {
  if (status === "with_manifest") {
    return { shipping_manifest_id: { not: null } };
  }

  if (status === "without_manifest") {
    return { shipping_manifest_id: null };
  }

  if (status === "courier_scan_completed") {
    return {
      shipping_manifest: {
        is: {
          loaded_at: { not: null },
          delivery_completed_at: null,
        },
      },
    };
  }

  return {
    shipping_manifest: {
      is: {
        delivery_completed_at: { not: null },
      },
    },
  };
};

export const getManifestStatusAnalyticsParams = (
  status: ShippingBinItemManifestStatusFilter,
): Pick<
  ShippingBinItemAnalyticsParams,
  | "with_manifest"
  | "without_manifest"
  | "courier_scan_completed"
  | "courier_dispatch"
> => ({
  with_manifest: status === "with_manifest" ? true : undefined,
  without_manifest: status === "without_manifest" ? true : undefined,
  courier_scan_completed:
    status === "courier_scan_completed" ? true : undefined,
  courier_dispatch: status === "courier_dispatch" ? true : undefined,
});

export const formatChartValue = (value: unknown) =>
  typeof value === "number" ? value.toLocaleString() : String(value ?? "");

export const hasAnalyticsData = (data: ShippingBinItemAnalytics | undefined) => {
  if (!data) return false;

  const validationTotal = Object.values(data.validation ?? {}).reduce(
    (sum, item) => sum + getTotalItems(item),
    0,
  );
  const workflowTotal = Object.values(data.workflow ?? {}).reduce(
    (sum, item) => sum + getTotalItems(item),
    0,
  );
  const processTotal =
    getTotalItems(data.process?.normal) + getTotalItems(data.process?.skip);
  const manifestTotal =
    (data.manifest?.with_manifest_count ?? 0) +
    (data.manifest?.without_manifest_count ?? 0) +
    (data.manifest?.total_courier_scan_completed ?? 0) +
    (data.manifest?.total_courier_dispatched ?? 0);
  const currentBinTotal = data.current_bin?.total_count ?? 0;

  return (
    data.total_items > 0 ||
    validationTotal > 0 ||
    workflowTotal > 0 ||
    processTotal > 0 ||
    manifestTotal > 0 ||
    currentBinTotal > 0
  );
};

export const toValidationChartData = (
  data: ShippingBinItemAnalytics | undefined,
): ChartDatum[] =>
  validationStatusOptions.map((status) => ({
    label: formatLabel(status),
    total_items: getTotalItems(data?.validation?.[status]),
  }));

export const toWorkflowChartData = (
  data: ShippingBinItemAnalytics | undefined,
): ChartDatum[] =>
  workflowStepOptions.map((step) => ({
    label: formatLabel(step),
    total_items: getTotalItems(data?.workflow?.[step]),
  }));

export const toProcessChartData = (
  data: ShippingBinItemAnalytics | undefined,
): ChartDatum[] => [
  {
    label: "Normal",
    total_items: getTotalItems(data?.process?.normal),
  },
  {
    label: "Skip Sweeping",
    total_items: getTotalItems(data?.process?.skip),
  },
];

export const toManifestChartData = (
  data: ShippingBinItemAnalytics | undefined,
): ChartDatum[] => [
  {
    label: "With Manifest",
    total_items: data?.manifest?.with_manifest_count ?? 0,
  },
  {
    label: "Without Manifest",
    total_items: data?.manifest?.without_manifest_count ?? 0,
  },
  {
    label: "Courier Scan Completed",
    total_items: data?.manifest?.total_courier_scan_completed ?? 0,
  },
  {
    label: "Courier Dispatched",
    total_items: data?.manifest?.total_courier_dispatched ?? 0,
  },
];

export const toShippingBinCodeChartData = (
  data: ShippingBinItemAnalytics | undefined,
  category: ShippingBinItemCurrentBinCategory,
): ChartDatum[] => {
  const totalsByCode = new Map<string, number>();
  const codes = data?.current_bin?.[category]?.shipping_bin_codes ?? {};

  Object.entries(codes).forEach(([code, value]) => {
    const optionValue = value.shipping_bin_codes || code;

    totalsByCode.set(optionValue, (totalsByCode.get(optionValue) ?? 0) + value.count);
  });

  return Array.from(totalsByCode.entries())
    .map(([label, total_items]) => ({ label, total_items }))
    .sort((left, right) => right.total_items - left.total_items || left.label.localeCompare(right.label))
    .slice(0, 20);
};
