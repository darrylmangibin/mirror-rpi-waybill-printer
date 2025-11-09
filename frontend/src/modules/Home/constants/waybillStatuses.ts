/**
 * Waybill Print Status Constants (Enum-like)
 * Mirrors the backend Python enum for type-safe status management
 */

export const WaybillPrintStatuses = {
  PENDING: 'pending',
  DOWNLOADED: 'downloaded',
  FOR_PRINTING: 'for_printing',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export type WaybillPrintStatus = 
  | typeof WaybillPrintStatuses.PENDING
  | typeof WaybillPrintStatuses.DOWNLOADED
  | typeof WaybillPrintStatuses.FOR_PRINTING
  | typeof WaybillPrintStatuses.COMPLETED
  | typeof WaybillPrintStatuses.ERROR;

/**
 * Helper to get human-readable status labels
 */
export const statusLabels: Record<WaybillPrintStatus, string> = {
  [WaybillPrintStatuses.PENDING]: 'Pending',
  [WaybillPrintStatuses.DOWNLOADED]: 'Downloaded',
  [WaybillPrintStatuses.FOR_PRINTING]: 'For Printing',
  [WaybillPrintStatuses.COMPLETED]: 'Completed',
  [WaybillPrintStatuses.ERROR]: 'Error',
};

/**
 * Helper to get status badge colors
 */
export const statusColors: Record<WaybillPrintStatus, string> = {
  [WaybillPrintStatuses.PENDING]: 'bg-yellow-100 text-yellow-800',
  [WaybillPrintStatuses.DOWNLOADED]: 'bg-blue-100 text-blue-800',
  [WaybillPrintStatuses.FOR_PRINTING]: 'bg-purple-100 text-purple-800',
  [WaybillPrintStatuses.COMPLETED]: 'bg-green-100 text-green-800',
  [WaybillPrintStatuses.ERROR]: 'bg-red-100 text-red-800',
};

