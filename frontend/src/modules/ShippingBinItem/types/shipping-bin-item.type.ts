export type ShippingBinItemValidationStatus =
  | "pending"
  | "verified_present"
  | "missing_from_bin"
  | "not_accepted_by_courier"
  | "no_tracking_number";

export type ShippingBinItemWorkflowStep =
  | "at_packing_station"
  | "being_validated"
  | "in_collection_bin"
  | "shipped_out"
  | "for_loading"
  | "loaded"
  | "not_accepted_by_courier";

export type ShippingBinItemSyncStatus =
  | "valid"
  | "cancelled"
  | "sync_failed";

export type ShippingBinItemMetaData = Record<string, unknown>;

export interface ShippingBinItem {
  id: string;
  invoice_number: string;
  tracking_number: string;
  courier_code: string;
  courier: string;
  platform_slug: string;
  marketplace: string;
  tenant_id: string;
  meta_data: ShippingBinItemMetaData | null;
  packing_table_id: string | null;
  current_bin_id: string | null;
  validation_session_id: string | null;
  validation_status: ShippingBinItemValidationStatus | null;
  workflow_step: ShippingBinItemWorkflowStep | null;
  validated_at: string | null;
  validator_username: string | null;
  voided_by_username: string | null;
  shipped_out_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  bin_shipment_id: string | null;
  shipping_manifest_id: string | null;
  sync_status: ShippingBinItemSyncStatus;
}

export interface ShippingBinItemAnalyticsParams {
  created_at_from?: string;
  created_at_to?: string;
  tenant_id?: string;
  marketplace?: string;
  validation_status?: ShippingBinItemValidationStatus;
  workflow_step?: ShippingBinItemWorkflowStep;
  skip_sweeping?: boolean;
}

export interface ShippingBinItemAnalyticsTotal {
  total: number;
}

export interface ShippingBinItemAnalyticsTenantBreakdown
  extends ShippingBinItemAnalyticsTotal {
  tenant_id: string | null;
}

export interface ShippingBinItemAnalyticsCourierBreakdown
  extends ShippingBinItemAnalyticsTotal {
  courier: string | null;
  courier_code: string | null;
}

export interface ShippingBinItemAnalyticsValidationStatusBreakdown
  extends ShippingBinItemAnalyticsTotal {
  validation_status: ShippingBinItemValidationStatus | null;
}

export interface ShippingBinItemAnalyticsWorkflowStepBreakdown
  extends ShippingBinItemAnalyticsTotal {
  workflow_step: ShippingBinItemWorkflowStep | null;
}

export interface ShippingBinItemAnalyticsSkipSweepingBreakdown
  extends ShippingBinItemAnalyticsTotal {
  skip_sweeping: boolean;
}

export interface ShippingBinItemAnalytics {
  parcels: ShippingBinItemAnalyticsTotal;
  orders: ShippingBinItemAnalyticsTotal;
  shipping_bin_items: ShippingBinItemAnalyticsTotal;
  tenant_breakdowns: ShippingBinItemAnalyticsTenantBreakdown[];
  courier_breakdowns: ShippingBinItemAnalyticsCourierBreakdown[];
  validation_status_breakdowns: ShippingBinItemAnalyticsValidationStatusBreakdown[];
  workflow_step_breakdowns: ShippingBinItemAnalyticsWorkflowStepBreakdown[];
  skip_sweeping_breakdowns: ShippingBinItemAnalyticsSkipSweepingBreakdown[];
}
