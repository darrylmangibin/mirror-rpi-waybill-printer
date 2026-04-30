import type { ApiQueryParams, Pagination } from "@/common/types/common.types";
import { nestApi } from "@/lib/nest.api";
import type { ShippingBin } from "@/modules/ShippingBin/types/shipping-bin.type";

export const getShippingBins = async (params?: ApiQueryParams) => {
  const { page, perPage, query } = params || {};
  const { data } = await nestApi.get<Pagination<ShippingBin>>(
    "/shipping-bins",
    {
      params: {
        page: page || 1,
        perPage: perPage || 10,
        query: query ? JSON.stringify(query) : undefined,
      },
    }
  );
  return data;
};
