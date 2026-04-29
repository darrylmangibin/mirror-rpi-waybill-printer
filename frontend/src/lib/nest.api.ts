import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const DEFAULTS = {
  productionApiUrl: "https://nest-api.fusiontech.asia",
  developmentApiUrl: "http://localhost:3001",
  tenantId: "staging-v2",
} as const;

const resolveTenantId = (tenantId?: string): string =>
  tenantId?.trim() || import.meta.env.VITE_NEST_TENANT_ID?.trim() || DEFAULTS.tenantId;

const createNestApiClient = (): AxiosInstance =>
  axios.create({
    baseURL: DEFAULTS.developmentApiUrl,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

const attachInterceptors = (
  client: AxiosInstance,
  tenantId?: string,
): AxiosInstance => {
  client.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      requestConfig.headers.set("x-tenant-id", resolveTenantId(tenantId));
      return requestConfig;
    },
  );

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  return client;
};

export const createNestApi = (tenantId?: string): AxiosInstance =>
  attachInterceptors(createNestApiClient(), tenantId);

export const customAxios = (tenantId: string): AxiosInstance =>
  createNestApi(tenantId);

export const nestApi = createNestApi();
