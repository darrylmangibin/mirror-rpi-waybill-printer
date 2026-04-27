/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ShippingBinItem } from "@/modules/ShippingBinItem/types/shipping-bin-item.type";
import { addItem } from "@/modules/ShippingManifest/services/add-item.service";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export type UseAddItemVariables = {
  shippingManifestId: string;
  payload: {
    tracking_number: string;
  };
};

export const useAddItem = (
  options?: UseMutationOptions<
    ShippingBinItem,
    AxiosError<any>,
    UseAddItemVariables
  >,
) => {
  const mutation = useMutation({
    mutationFn: async ({ shippingManifestId, payload }) =>
      addItem(shippingManifestId, payload),
    ...options,
  });

  return mutation;
};
