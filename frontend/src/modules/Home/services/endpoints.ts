import { buildApiUrl } from '@/config';

/**
 * API Endpoints for Home Module - Waybill Service
 * Using getter functions to ensure API_BASE_URL is loaded at call time
 */

export const WAYBILL_ENDPOINTS = {
  // Waybill operations - lazy evaluation to ensure config is loaded
  get LIST_PRINTS() { return buildApiUrl('/api/waybills/prints'); },
  get CREATE_PRINT() { return buildApiUrl('/api/waybills/prints'); },
  UPDATE_PRINT: (id: number) => buildApiUrl(`/api/waybills/prints/${id}`),
  DELETE_PRINT: (id: number) => buildApiUrl(`/api/waybills/prints/${id}`),
  DOWNLOAD_PRINT: (id: number) => buildApiUrl(`/api/waybills/prints/${id}/download`),
  PRINT_PRINT: (id: number) => buildApiUrl(`/api/waybills/prints/${id}/print`),
  UPDATE_STATUS: (id: number) => buildApiUrl(`/api/waybills/prints/${id}/status`),
} as const;

export const NETWORK_ENDPOINTS = {
  // Network operations - lazy evaluation
  get GET_PRINT_JOB_QR() { return buildApiUrl('/api/network/local-ip'); },
} as const;
