/**
 * API Endpoints for Home Module - Waybill Service
 */

export const WAYBILL_ENDPOINTS = {
  // Waybill operations
  LIST_PRINTS: '/api/waybills/prints',
  
  // Future endpoints for CRUD operations
  // CREATE_PRINT: '/api/prints',
  // UPDATE_PRINT: (id: number) => `/api/prints/${id}`,
  // DELETE_PRINT: (id: number) => `/api/prints/${id}`,
} as const;
