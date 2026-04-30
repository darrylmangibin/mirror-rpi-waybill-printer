/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiQueryParams, Pagination } from "@/common/types/common.types";
import { SHIPPING_BINS_QUERY_KEY } from "@/modules/ShippingBin/constants/shipping-bin.constant";
import { getShippingBins } from "@/modules/ShippingBin/services/shipping-bin.service";
import type { ShippingBin } from "@/modules/ShippingBin/types/shipping-bin.type";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const useGetShippingBins = (
  params?: ApiQueryParams,
  options?: Omit<
    UseQueryOptions<Pagination<ShippingBin>, AxiosError<any>>,
    "queryKey" | "queryFn"
  >
) => {
  const query = useQuery({
    queryKey: [SHIPPING_BINS_QUERY_KEY, params],
    queryFn: async () => await getShippingBins(params),
    ...options,
  });

  return query;
};
