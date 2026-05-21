/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  requestExport,
  type RequestExportPayload,
  type ShippingManifestExportRequest,
} from "@/modules/ShippingManifest/services/request-export.service";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export type UseRequestExportVariables = {
  shippingManifestId: string;
  payload: RequestExportPayload;
};

export const useRequestExport = (
  options?: UseMutationOptions<
    ShippingManifestExportRequest,
    AxiosError<any>,
    UseRequestExportVariables
  >,
) => {
  const mutation = useMutation({
    mutationFn: async ({ shippingManifestId, payload }) =>
      requestExport(shippingManifestId, payload),
    ...options,
  });

  return mutation;
};
