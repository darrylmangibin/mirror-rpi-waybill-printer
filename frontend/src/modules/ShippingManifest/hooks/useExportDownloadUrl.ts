/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getShippingManifestExportDownloadUrl,
  type ShippingManifestExportDownloadUrl,
} from "@/modules/ShippingManifest/services/get-export-download-url.service";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export type UseExportDownloadUrlVariables = {
  exportId: string;
};

export const useExportDownloadUrl = (
  options?: UseMutationOptions<
    ShippingManifestExportDownloadUrl,
    AxiosError<any>,
    UseExportDownloadUrlVariables
  >,
) => {
  const mutation = useMutation({
    mutationFn: async ({ exportId }) =>
      getShippingManifestExportDownloadUrl(exportId),
    ...options,
  });

  return mutation;
};
