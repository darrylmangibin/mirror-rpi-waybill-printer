/**
 * API Endpoints for Home Module - Waybill Service
 */

export const WAYBILL_ENDPOINTS = {
  // Waybill operations
  LIST_PRINTS: '/api/waybills/prints',
  CREATE_PRINT: '/api/waybills/prints',
  UPDATE_PRINT: (id: number) => `/api/waybills/prints/${id}`,
  DELETE_PRINT: (id: number) => `/api/waybills/prints/${id}`,
} as const;

export const NETWORK_ENDPOINTS = {
  // Network operations
  GET_PRINT_JOB_QR: '/api/network/local-ip',
} as const;
