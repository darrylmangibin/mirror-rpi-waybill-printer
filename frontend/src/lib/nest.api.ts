import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const DEFAULTS = {
  productionApiUrl: "https://nest-api.fusiontech.asia",
  developmentApiUrl: "http://localhost:3001",
  tenantId: "staging-v2",
} as const;

const resolveTenantId = (): string =>
  import.meta.env.VITE_NEST_TENANT_ID?.trim() || DEFAULTS.tenantId;

const setTenantHeader = (
  requestConfig: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const tenantId = resolveTenantId();
  requestConfig.headers.set("x-tenant-id", tenantId);
  return requestConfig;
};

export const nestApi = axios.create({
  baseURL: DEFAULTS.developmentApiUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

nestApi.interceptors.request.use(setTenantHeader);

nestApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);
