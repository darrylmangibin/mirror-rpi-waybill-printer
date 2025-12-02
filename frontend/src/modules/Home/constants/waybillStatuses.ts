/**
 * Waybill Print Status Constants (Enum-like)
 * Mirrors the backend Python enum for type-safe status management
 */

export const WaybillPrintStatuses = {
  PENDING: 'pending',
  DOWNLOADING: 'downloading',
  DOWNLOADED: 'downloaded',
  PRINTING: 'printing',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled',
} as const;

export type WaybillPrintStatus = 
  | typeof WaybillPrintStatuses.PENDING
  | typeof WaybillPrintStatuses.DOWNLOADING
  | typeof WaybillPrintStatuses.DOWNLOADED
  | typeof WaybillPrintStatuses.PRINTING
  | typeof WaybillPrintStatuses.COMPLETED
  | typeof WaybillPrintStatuses.ERROR
  | typeof WaybillPrintStatuses.CANCELLED;

/**
 * Helper to get human-readable status labels
 */
export const statusLabels: Record<WaybillPrintStatus, string> = {
  [WaybillPrintStatuses.PENDING]: 'Pending',
  [WaybillPrintStatuses.DOWNLOADING]: 'Downloading',
  [WaybillPrintStatuses.DOWNLOADED]: 'Downloaded',
  [WaybillPrintStatuses.PRINTING]: 'Printing',
  [WaybillPrintStatuses.COMPLETED]: 'Completed',
  [WaybillPrintStatuses.ERROR]: 'Error',
  [WaybillPrintStatuses.CANCELLED]: 'Cancelled',
};

/**
 * Helper to get status badge colors
 */
export const statusColors: Record<WaybillPrintStatus, string> = {
  [WaybillPrintStatuses.PENDING]: 'bg-yellow-100 text-yellow-800',
  [WaybillPrintStatuses.DOWNLOADING]: 'bg-blue-100 text-blue-800',
  [WaybillPrintStatuses.DOWNLOADED]: 'bg-blue-100 text-blue-800',
  [WaybillPrintStatuses.PRINTING]: 'bg-purple-100 text-purple-800',
  [WaybillPrintStatuses.COMPLETED]: 'bg-green-100 text-green-800',
  [WaybillPrintStatuses.ERROR]: 'bg-red-100 text-red-800',
  [WaybillPrintStatuses.CANCELLED]: 'bg-orange-100 text-orange-800',
};

