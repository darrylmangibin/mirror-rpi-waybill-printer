import { nestApi } from "@/lib";
import type { ManifestQueueJob } from "@/modules/ShippingManifest/types/shipping-manifest.type";

export const getShippingManifestStatusJobs = async (manifestId: string) => {
  const { data } = await nestApi.get<ManifestQueueJob[]>(
    `/shipping-manifests/${manifestId}/invoice-status/jobs`
  );

  return data;
};
