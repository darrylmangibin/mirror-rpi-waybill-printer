export type ShippingManifestStatus =
  | "pending"
  | "processing"
  | "sweeping"
  | "staging"
  | "for_delivery"
  | "completed"
  | "open"
  | "closed"
  | "for_loading"
  | "loaded";

export type ShippingManifestListStatus = Extract<
  ShippingManifestStatus,
  "open" | "closed" | "for_loading" | "loaded" | "completed"
>;

export type ShippingManifestGenerationType = "manual" | "automatic";

export type ShippingManifestMetaData = Record<string, unknown>;

export interface ShippingManifest {
  id: string;
  manifest_code: string;
  shipping_carrier: string;
  carrier_code: string | null;
  manifest_path: string | null;
  meta_data: ShippingManifestMetaData | null;
  generation_type: ShippingManifestGenerationType;
  generated_by_id: string | null;
  generated_by_username: string | null;
  tenant_id: string;
  status: ShippingManifestStatus;
  delivery_completed_at: string | null;
  created_at: string;
  updated_at: string;
  loaded_orders_count: number | null;
  loading_started_at: string | null;
  loaded_at: string | null;
  receiver_name: string | null;
  vehicle_plate_number: string | null;
}
