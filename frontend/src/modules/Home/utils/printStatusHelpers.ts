import { PrintStatus, PrintStatuses } from '../constants/printStatuses';
import {
  PrinterIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Get the appropriate icon component for a print status
 */
export const getPrintStatusIcon = (status: PrintStatus | null): ReactNode => {
  switch (status) {
    case PrintStatuses.IDLE:
      return <PrinterIcon className="w-3.5 h-3.5 text-gray-600" />;
    case PrintStatuses.PRINTING:
      return <Loader2Icon className="w-3.5 h-3.5 text-blue-600 animate-spin" />;
    case PrintStatuses.COMPLETED:
      return <CheckCircle2Icon className="w-3.5 h-3.5 text-green-600" />;
    case PrintStatuses.ERROR:
    case PrintStatuses.CANCELLED:
      return <AlertCircleIcon className="w-3.5 h-3.5 text-red-600" />;
    default:
      return <PrinterIcon className="w-3.5 h-3.5 text-gray-600" />;
  }
};

