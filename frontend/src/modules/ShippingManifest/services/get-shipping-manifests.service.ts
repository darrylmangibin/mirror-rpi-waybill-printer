import type { ApiQueryParams, Pagination } from "@/common/types/common.types";
import { nestApi } from "@/lib/nest.api";
import type { ShippingManifest } from "@/modules/ShippingManifest/types/shipping-manifest.type";

export const getShippingManifests = async (params?: ApiQueryParams) => {
  const { page, perPage, query } = params || {};
  const { data } = await nestApi.get<Pagination<ShippingManifest>>(
    "/shipping-manifests",
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

export const getShippingManifestById = async (
  id: string,
  params?: Omit<ApiQueryParams, "page" | "perPage">,
) => {
  const { data } = await nestApi.get<ShippingManifest>(
    `/shipping-manifests/${id}`,
    {
      params: {
        query: params?.query ? JSON.stringify(params.query) : undefined,
      },
    },
  );

  return data;
};
