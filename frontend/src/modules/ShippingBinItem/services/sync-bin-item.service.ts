import { nestApi } from "@/lib/nest.api";

export const syncBinItem = async (shippingBinItemId: string) => {
  const { data } = await nestApi.post<{
    success: boolean;
    data: {
      shipping_bin_item_id: string;
      bin_sweeping_session_id: string;
      tenant_id: string;
      invoice_number: string;
      previous_sync_status: string;
      sync_status: string;
    };
  }>(`/shipping-bin-items/${shippingBinItemId}/sync`);

  return data;
};
