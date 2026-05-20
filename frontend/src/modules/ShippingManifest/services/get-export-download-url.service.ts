import { nestApi } from "@/lib/nest.api";

export type ShippingManifestExportDownloadUrl = {
  url: string;
};

export const getShippingManifestExportDownloadUrl = async (exportId: string) => {
  const { data } = await nestApi.get<ShippingManifestExportDownloadUrl>(
    `/shipping-manifest-exports/${exportId}/download`,
  );

  return data;
};
