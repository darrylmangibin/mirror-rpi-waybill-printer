/**
 * Print Status Constants (Enum-like)
 * Mirrors the backend Python PrintStatuses enum for type-safe status management
 * 
 * Note: PrintStatuses are separate from WaybillPrintStatuses
 * - WaybillPrintStatuses: Overall waybill lifecycle (pending, downloading, downloaded, printing, completed, error, cancelled)
 * - PrintStatuses: Print-specific phases (idle, printing, completed, error, cancelled)
 */

export const PrintStatuses = {
  IDLE: 'idle',
  PRINTING: 'printing',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled',
} as const;

export type PrintStatus = typeof PrintStatuses[keyof typeof PrintStatuses];

/**
 * Helper to get human-readable status labels
 */
export const printStatusLabels: Record<PrintStatus, string> = {
  [PrintStatuses.IDLE]: 'Idle',
  [PrintStatuses.PRINTING]: 'Printing',
  [PrintStatuses.COMPLETED]: 'Printed',
  [PrintStatuses.ERROR]: 'Failed',
  [PrintStatuses.CANCELLED]: 'Cancelled',
};

/**
 * Helper to get status badge gradient classes
 */
export const printStatusGradients: Record<PrintStatus, string> = {
  [PrintStatuses.IDLE]: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200',
  [PrintStatuses.PRINTING]: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200',
  [PrintStatuses.COMPLETED]: 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200',
  [PrintStatuses.ERROR]: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200',
  [PrintStatuses.CANCELLED]: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200',
};

