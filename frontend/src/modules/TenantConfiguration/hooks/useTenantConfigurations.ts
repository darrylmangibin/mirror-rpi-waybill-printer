/* eslint-disable @typescript-eslint/no-explicit-any */
import { TENANT_CONFIGURATIONS_QUERY_KEY } from "@/modules/TenantConfiguration/constants/tenant-configuration.constant";
import { getTenantConfigurations } from "@/modules/TenantConfiguration/services/tenant-configuration.service";
import type { TenantConfiguration } from "@/modules/TenantConfiguration/types/tenant-configuration.type";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const useTenantConfigurations = (
  options?: Omit<
    UseQueryOptions<TenantConfiguration[], AxiosError<any>>,
    "queryKey" | "queryFn"
  >,
) => {
  const query = useQuery({
    queryKey: [TENANT_CONFIGURATIONS_QUERY_KEY],
    queryFn: async () => await getTenantConfigurations(),
    ...options,
  });

  return query;
};
