import { nestApi } from "@/lib/nest.api";

export type ShippingManifestExportRequest = {
  exportId: string;
  status: string;
};

export type RequestExportPayload = {
  filter_type?: "all" | "selected_shipping_bin_items" | "tenant";
  shipping_bin_item_ids?: string[];
  tenant_ids?: string[];
};

export const requestExport = async (
  shippingManifestId: string,
  payload: RequestExportPayload = {},
) => {
  const { data } = await nestApi.post<ShippingManifestExportRequest>(
    `/shipping-manifest-exports/${shippingManifestId}`,
    {
      filter_type: payload.filter_type ?? "all",
      shipping_bin_item_ids: payload.shipping_bin_item_ids,
      tenant_ids: payload.tenant_ids,
    },
  );

  return data;
};
