/* eslint-disable @typescript-eslint/no-explicit-any */
import { closeManifest } from "@/modules/ShippingManifest/services/close-manifest.service";
import type { ShippingManifest } from "@/modules/ShippingManifest/types/shipping-manifest.type";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export type UseCloseManifestVariables = {
  manifestId: string;
};

export const useCloseManifest = (
  options?: UseMutationOptions<
    ShippingManifest,
    AxiosError<any>,
    UseCloseManifestVariables
  >,
) => {
  const mutation = useMutation({
    mutationFn: async ({ manifestId }) => await closeManifest(manifestId),
    ...options,
  });

  return mutation;
};
