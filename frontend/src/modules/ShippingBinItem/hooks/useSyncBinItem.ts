/* eslint-disable @typescript-eslint/no-explicit-any */
import { syncBinItem } from "@/modules/ShippingBinItem/services/sync-bin-item.service";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export type UseSyncBinItemVariables = {
  shippingBinItemId: string;
};

type SyncBinItemResponse = Awaited<ReturnType<typeof syncBinItem>>;

export const useSyncBinItem = (
  options?: UseMutationOptions<
    SyncBinItemResponse,
    AxiosError<any>,
    UseSyncBinItemVariables
  >,
) => {
  const mutation = useMutation({
    mutationFn: async ({ shippingBinItemId }) =>
      await syncBinItem(shippingBinItemId),
    ...options,
  });

  return mutation;
};
