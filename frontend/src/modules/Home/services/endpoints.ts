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
  CANCEL_PRINT: (id: number) => buildApiUrl(`/api/waybills/prints/${id}/cancel`),
  UPDATE_STATUS: (id: number) => buildApiUrl(`/api/waybills/prints/${id}/status`),
  PREVIEW_FILE: (id: number, download?: boolean) => {
    const url = buildApiUrl(`/api/waybills/prints/${id}/preview`);
    return download ? `${url}?download=true` : url;
  },
  
  // Routes by Invoice Number - Print Only
  PRINT_BY_INVOICE: () => buildApiUrl(`/api/waybills/prints/by-invoice/print`),
  GET_STATUS_BY_INVOICE: (invoiceNumber: string, tenantId: string) => buildApiUrl(`/api/waybills/prints/by-invoice/status?invoice_number=${invoiceNumber}&tenant_id=${tenantId}`),
  CANCEL_BY_INVOICE: () => buildApiUrl(`/api/waybills/prints/by-invoice/cancel`),
} as const;

export const NETWORK_ENDPOINTS = {
  // Network operations - lazy evaluation
  get GET_PRINT_JOB_QR() { return buildApiUrl('/api/network/local-ip'); },
} as const;
