/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, type MutationOptions } from "@tanstack/react-query";
import { closeAndCreate } from "../services/close-and-create.service";
import type { ShippingManifest } from "@/modules/ShippingManifest/types/shipping-manifest.type";
import type { AxiosError } from "axios";

export type UseCloseAndCreateVariables = {
  shippingBinCode: string;
};

export const useCloseAndCreate = (
  options?: MutationOptions<
    ShippingManifest,
    AxiosError<any>,
    UseCloseAndCreateVariables
  >,
) => {
  const mutation = useMutation({
    mutationFn: ({ shippingBinCode }) => closeAndCreate(shippingBinCode),
    ...options,
  });

  return mutation;
};
