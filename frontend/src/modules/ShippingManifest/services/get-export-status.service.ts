import { nestApi } from "@/lib/nest.api";

export type ShippingManifestExportStatus = {
  status: string;
};

export const getShippingManifestExportStatus = async (
  shippingManifestExportId: string,
) => {
  const { data } = await nestApi.get<ShippingManifestExportStatus>(
    `/shipping-manifest-exports/${shippingManifestExportId}`,
  );

  return data;
};
