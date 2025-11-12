/**
 * Query keys for waybill-related TanStack Query operations
 */
export const WAYBILL_QUERY_KEYS = {
  waybills: ['waybills'] as const,
  printJobQREndPoint: ['printJobQREndPoint'] as const,
  printWaybill: ['printWaybill'] as const,
} as const;
