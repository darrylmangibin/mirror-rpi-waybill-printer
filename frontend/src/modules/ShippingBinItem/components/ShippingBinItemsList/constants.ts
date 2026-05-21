import type { ShippingBinItemSyncStatus } from "@/modules/ShippingBinItem/types/shipping-bin-item.type";
import type {
  BadgeConfig,
  SyncStatusFilterOption,
  ValidationBadgeConfig,
  WorkflowBadgeConfig,
} from "./types";

export const perPageOptions = [10, 20, 50, 100];

export const syncStatusOptions: SyncStatusFilterOption[] = [
  { key: "all", label: "All", statuses: [] },
  {
    key: "included-in-manifest",
    label: "Included in Manifest",
    statuses: ["valid", "sync_failed"],
  },
  { key: "valid", label: "Valid", statuses: ["valid"] },
  { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
  {
    key: "sync_failed",
    label: "Sync Failed",
    statuses: ["sync_failed"],
  },
];

export const COLUMNS = 9;

export const syncStatusConfig: Record<ShippingBinItemSyncStatus, BadgeConfig> = {
  valid: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  cancelled: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-400",
  },
  sync_failed: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
};

export const workflowConfig: WorkflowBadgeConfig = {
  at_packing_station: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  being_validated: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  in_collection_bin: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-400",
  },
  shipped_out: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
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
  not_accepted_by_courier: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-400",
  },
};

export const validationConfig: ValidationBadgeConfig = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  verified_present: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  missing_from_bin: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-400",
  },
  not_accepted_by_courier: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  no_tracking_number: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export const defaultBadgeConfig: BadgeConfig = {
  bg: "bg-slate-50",
  text: "text-slate-600",
  border: "border-slate-200",
  dot: "bg-slate-400",
};
