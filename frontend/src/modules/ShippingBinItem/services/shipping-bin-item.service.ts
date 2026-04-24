import type { ApiQueryParams, Pagination } from "@/common/types/common.types";
import { nestApi } from "@/lib/nest.api";
import type { ShippingBinItem } from "@/modules/ShippingBinItem/types/shipping-bin-item.type";

export const getShippingBinItems = async (params?: ApiQueryParams) => {
  const { page, perPage, query } = params || {};
  const { data } = await nestApi.get<Pagination<ShippingBinItem>>(
    "/shipping-bin-items",
    {
      params: {
        query: query ? JSON.stringify(query) : undefined,
        page: page || 1,
        perPage: perPage || 10,
      },
    },
  );

  return data;
};
