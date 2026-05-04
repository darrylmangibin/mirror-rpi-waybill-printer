import { nestApi } from "@/lib";

export const retryShippingManifestJob = async (
  manifestId: string,
  jobId: string
) => {
  const { data } = await nestApi.post<{
    job_id: string;
    manifest_id: string;
    chunk_job_count: number;
    message: string;
  }>(
    `/shipping-manifests/${manifestId}/invoice-status/bulk-update/retry/${jobId}`
  );

  return data;
};
