/* eslint-disable @typescript-eslint/no-explicit-any */
import { createByTrackingNumber } from "@/modules/ShippingManifest/services/create-by-tracking-number.service";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

export type UseCreateByTrackingNumberVariables = {
  shippingManifestId: Parameters<typeof createByTrackingNumber>[0];
  payload: Parameters<typeof createByTrackingNumber>[1];
};

export const useCreateByTrackingNumber = (
  options?: UseMutationOptions<any, any, UseCreateByTrackingNumberVariables>
) => {
  const mutation = useMutation({
    mutationFn: async ({
      shippingManifestId,
      payload,
    }: UseCreateByTrackingNumberVariables) =>
      await createByTrackingNumber(shippingManifestId, payload),
    ...options,
  });

  return mutation;
};
