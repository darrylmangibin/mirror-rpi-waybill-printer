import type { ApiQueryParams } from "@/common/types/common.types";
import { nestApi } from "@/lib/nest.api";

export const getShippingManifests = async (params?: ApiQueryParams) => {
  const { page, perPage, query } = params || {};
  const { data } = await nestApi.get("/shipping-manifests", {
    params: {
      query: query ? JSON.stringify(query) : undefined,
      page: page || 1,
      perPage: perPage || 10,
    },
  });

  return data;
};
