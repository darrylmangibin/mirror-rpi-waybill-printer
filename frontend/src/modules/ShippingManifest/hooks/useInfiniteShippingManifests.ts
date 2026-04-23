import type { ApiQueryParams, Pagination } from "@/common/types/common.types";
import type { ShippingManifest } from "@/modules/ShippingManifest/types/shipping-manifest.type";
import { SHIPPING_MANIFESTS_QUERY_KEY } from "@/modules/ShippingManifest/constants/shipping-manifest.constant";
import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { getShippingManifests } from "@/modules/ShippingManifest/services/get-shipping-manifests.service";

type Page = Pagination<ShippingManifest>;

export const useInfiniteShippingManifests = (
  params?: ApiQueryParams,
  options?: Omit<
    UseInfiniteQueryOptions<Page, Error>,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam" | "select"
  >,
) => {
  const { ...rest } = params ?? {};
  const query = useInfiniteQuery({
    queryKey: [SHIPPING_MANIFESTS_QUERY_KEY, params],
    queryFn: ({ pageParam = 1 }) =>
      getShippingManifests({
        ...rest,
        page: pageParam as number,
        perPage: params?.perPage,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page === lastPage.meta.last_page) {
        return undefined;
      }
      return lastPage.meta.current_page + 1;
    },
    ...options,
  });

  const results = useMemo(() => {
    return query.data?.pages.reduce((acc: ShippingManifest[], page: Page) => {
      return [...acc, ...page.data];
    }, [] as ShippingManifest[]);
  }, [query.data]);

  const [page] = query.data?.pages ?? [];

  const total = page?.meta.total;

  return {
    ...query,
    results,
    total,
  };
};
