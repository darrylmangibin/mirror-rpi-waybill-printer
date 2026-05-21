import { SHIPPING_MANIFEST_EXPORT_STATUS_QUERY_KEY } from "@/modules/ShippingManifest/constants/shipping-manifest.constant";
import {
  getShippingManifestExportStatus,
  type ShippingManifestExportStatus,
} from "@/modules/ShippingManifest/services/get-export-status.service";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export const useShippingManifestExportStatus = (
  shippingManifestExportId: string,
  options?: Omit<
    UseQueryOptions<ShippingManifestExportStatus, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const query = useQuery({
    queryKey: [
      SHIPPING_MANIFEST_EXPORT_STATUS_QUERY_KEY,
      shippingManifestExportId,
    ],
    queryFn: () => getShippingManifestExportStatus(shippingManifestExportId),
    ...options,
  });

  return query;
};
