import { nestApi } from "@/lib";
import type { TenantConfiguration } from "@/modules/TenantConfiguration/types/tenant-configuration.type";

export const getTenantConfigurations = async () => {
  const { data } = await nestApi.get<TenantConfiguration[]>(
    "/tenant-configurations",
  );

  return data;
};
