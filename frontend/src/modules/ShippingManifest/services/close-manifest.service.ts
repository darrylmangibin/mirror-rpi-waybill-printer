import { nestApi } from "@/lib/nest.api";
import type { ShippingManifest } from "@/modules/ShippingManifest/types/shipping-manifest.type";

export const closeManifest = async (manifestId: string) => {
  const { data } = await nestApi.post<ShippingManifest>(
    `/shipping-manifests/${manifestId}/close`,
  );

  return data;
};
