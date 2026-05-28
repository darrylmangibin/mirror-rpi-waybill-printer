import type { ApiQueryParams, Pagination } from "@/common/types/common.types";
import {
  SHIPPING_BIN_ITEM_ANALYTICS_QUERY_KEY,
  SHIPPING_BIN_ITEMS_QUERY_KEY,
} from "@/modules/ShippingBinItem/constants/shipping-bin-item.constant";
import {
  getShippingBinItemAnalytics,
  getShippingBinItems,
} from "@/modules/ShippingBinItem/services/shipping-bin-item.service";
import type {
  ShippingBinItem,
  ShippingBinItemAnalytics,
  ShippingBinItemAnalyticsParams,
} from "@/modules/ShippingBinItem/types/shipping-bin-item.type";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const useShippingBinItems = (
  params: ApiQueryParams,
  options?: Omit<
    UseQueryOptions<Pagination<ShippingBinItem>, AxiosError>,
    "queryKey" | "queryFn"
  >,
) => {
  const query = useQuery({
    queryKey: [SHIPPING_BIN_ITEMS_QUERY_KEY, params],
    queryFn: () => getShippingBinItems(params),
    ...options,
  });

  return query;
};

export const useShippingBinItemAnalytics = (
  params?: ShippingBinItemAnalyticsParams,
  options?: Omit<
    UseQueryOptions<ShippingBinItemAnalytics, AxiosError>,
    "queryKey" | "queryFn"
  >,
) => {
  const query = useQuery({
    queryKey: [SHIPPING_BIN_ITEM_ANALYTICS_QUERY_KEY, params],
    queryFn: () => getShippingBinItemAnalytics(params),
    ...options,
  });

  return query;
};
