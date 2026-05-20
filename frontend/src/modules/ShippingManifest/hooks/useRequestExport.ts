/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  requestExport,
  type ShippingManifestExportRequest,
} from "@/modules/ShippingManifest/services/request-export.service";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export type UseRequestExportVariables = {
  shippingManifestId: string;
};

export const useRequestExport = (
  options?: UseMutationOptions<
    ShippingManifestExportRequest,
    AxiosError<any>,
    UseRequestExportVariables
  >,
) => {
  const mutation = useMutation({
    mutationFn: async ({ shippingManifestId }) =>
      requestExport(shippingManifestId),
    ...options,
  });

  return mutation;
};
