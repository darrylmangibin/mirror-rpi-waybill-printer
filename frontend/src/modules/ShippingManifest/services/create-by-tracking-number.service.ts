import { createNestApi } from "@/lib";

export type CreateByTrackingNumberPayload = {
  trackingNumber: string;
  tenantId: string;
  shippingBinCode: string;
};

export const createByTrackingNumber = async (
  shippingManifestId: string,
  { trackingNumber, tenantId, shippingBinCode }: CreateByTrackingNumberPayload
) => {
  const api = createNestApi(tenantId);

  const { data } = await api.post(
    `/shipping-manifests/${shippingManifestId}/create-shipping-bin-item`,
    {
      tracking_number: trackingNumber,
      shipping_bin_code: shippingBinCode,
    }
  );

  return data;
};
