import { nestApi } from "@/lib/nest.api";
import type { ShippingManifest } from "@/modules/ShippingManifest/types/shipping-manifest.type";

export const createByShippingBinCode = async (shippingBinCode: string) => {
  const code = shippingBinCode.trim();

  if (!code) {
    throw new Error("Shipping bin code is required.");
  }

  const { data } = await nestApi.post<ShippingManifest>(
    `/shipping-manifests/shipping-bin/${code}`,
  );

  return data;
};
