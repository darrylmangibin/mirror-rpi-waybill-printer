import { SHIPPING_MANIFEST_STATUS_JOBS_QUERY_KEY } from "@/modules/ShippingManifest/constants/shipping-manifest.constant";
import { getShippingManifestStatusJobs } from "@/modules/ShippingManifest/services/update-status-jobs.service";
import type { ManifestQueueJob } from "@/modules/ShippingManifest/types/shipping-manifest.type";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export const useShippingManifestStatusJobs = (
  manifestId: string,
  options?: Omit<
    UseQueryOptions<ManifestQueueJob[], Error>,
    "queryKey" | "queryFn"
  >
) => {
  const query = useQuery({
    queryKey: [SHIPPING_MANIFEST_STATUS_JOBS_QUERY_KEY, manifestId],
    queryFn: () => getShippingManifestStatusJobs(manifestId),
    ...options,
  });

  return query;
};
