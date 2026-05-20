import { nestApi } from "@/lib/nest.api";

export type ShippingManifestExportRequest = {
  exportId: string;
  status: string;
};

export const requestExport = async (shippingManifestId: string) => {
  const { data } = await nestApi.post<ShippingManifestExportRequest>(
    `/shipping-manifest-exports/${shippingManifestId}`,
  );

  return data;
};
