/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { createByShippingBinCode } from "../services/create-by-shipping-bin-code.service";
import type { ShippingManifest } from "@/modules/ShippingManifest/types/shipping-manifest.type";
import type { AxiosError } from "axios";

export type UseCreateByShippingBinCodeVariables = {
  shippingBinCode: string;
};

export const useCreateByShippingBinCode = (
  options?: UseMutationOptions<
    ShippingManifest,
    AxiosError<any>,
    UseCreateByShippingBinCodeVariables
  >,
) => {
  return useMutation({
    mutationFn: ({ shippingBinCode }) =>
      createByShippingBinCode(shippingBinCode),
    ...options,
  });
};
