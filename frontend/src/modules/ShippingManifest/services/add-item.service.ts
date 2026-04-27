import { nestApi } from "@/lib/nest.api";
import type { ShippingBinItem } from "@/modules/ShippingBinItem/types/shipping-bin-item.type";

export interface AddItemPayload {
  tracking_number: string;
}

export const addItem = async (
  shippingManifestId: string,
  payload: AddItemPayload,
) => {
  const { data } = await nestApi.post<ShippingBinItem>(
    `/shipping-manifests/${shippingManifestId}/add-item`,
    payload,
  );

  return data;
};
