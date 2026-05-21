import type {
  ShippingBinItemSyncStatus,
  ShippingBinItemValidationStatus,
  ShippingBinItemWorkflowStep,
} from "@/modules/ShippingBinItem/types/shipping-bin-item.type";

export type SyncStatusFilterOption = {
  key: string;
  label: string;
  statuses: ShippingBinItemSyncStatus[];
};

export type BadgeConfig = {
  bg: string;
  text: string;
  border: string;
  dot: string;
};

export type WorkflowBadgeConfig = Partial<
  Record<ShippingBinItemWorkflowStep, BadgeConfig>
>;

export type ValidationBadgeConfig = Partial<
  Record<ShippingBinItemValidationStatus, BadgeConfig>
>;
