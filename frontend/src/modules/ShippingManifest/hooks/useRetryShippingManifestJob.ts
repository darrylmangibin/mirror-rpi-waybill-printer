/* eslint-disable @typescript-eslint/no-explicit-any */
import { retryShippingManifestJob } from "@/modules/ShippingManifest/services/rety-job.service";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export type UseRetryShippingManifestJobVariables = {
  shippingManifestId: string;
  jobId: string;
};

export const useRetryShippingManifestJob = (
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof retryShippingManifestJob>>,
    AxiosError<any>,
    UseRetryShippingManifestJobVariables
  >
) => {
  const mutation = useMutation({
    mutationFn: async ({ shippingManifestId, jobId }) =>
      await retryShippingManifestJob(shippingManifestId, jobId),
    ...options,
  });

  return mutation;
};
