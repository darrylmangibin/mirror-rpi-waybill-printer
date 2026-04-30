export type ShippingBinCategory = "shipping_station" | "collection_hub";

export interface ShippingBin {
  id: string;
  shipping_bin_code: string;
  category: ShippingBinCategory;
  courier_code: string;
  courier: string;
  packing_table_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
