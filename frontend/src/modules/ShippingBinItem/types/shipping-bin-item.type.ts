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
  total?: number;
  total_items?: number;
  count?: number;
}

export interface ShippingBinItemAnalyticsTenants {
  count: number;
  tenant_ids: string[];
}

export interface ShippingBinItemAnalyticsCourier {
  count: number;
  codes: string[];
}

export interface ShippingBinItemAnalyticsMarketplace {
  count: number;
  integration_name: string[];
}

export type ShippingBinItemAnalyticsValidation = Record<
  ShippingBinItemValidationStatus,
  ShippingBinItemAnalyticsTotal
>;

export type ShippingBinItemAnalyticsWorkflow = Record<
  ShippingBinItemWorkflowStep,
  ShippingBinItemAnalyticsTotal
>;

export interface ShippingBinItemAnalyticsProcess {
  normal: ShippingBinItemAnalyticsTotal;
  skip: ShippingBinItemAnalyticsTotal;
}

export interface ShippingBinItemAnalytics {
  tenants: ShippingBinItemAnalyticsTenants;
  courier: ShippingBinItemAnalyticsCourier;
  marketplace: ShippingBinItemAnalyticsMarketplace;
  validation: ShippingBinItemAnalyticsValidation;
  workflow: ShippingBinItemAnalyticsWorkflow;
  process: ShippingBinItemAnalyticsProcess;
  total_items: number;
}
