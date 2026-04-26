import { nestApi } from "@/lib/nest.api";
import type { ShippingManifest } from "@/modules/ShippingManifest/types/shipping-manifest.type";

export const closeAndCreate = async (shippingBinCode: string) => {
  const { data } = await nestApi.post<ShippingManifest>(
    `/shipping-manifests/shipping-bin/${shippingBinCode}/close-and-create-new`,
  );

  return data;
};
