import { format } from "date-fns";
import type {
  ShippingBinItemAnalytics,
  ShippingBinItemAnalyticsTotal,
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

  return (
    data.total_items > 0 ||
    validationTotal > 0 ||
    workflowTotal > 0 ||
    processTotal > 0
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
