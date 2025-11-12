import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waybillService, type WaybillsResponse } from '@/modules/Home/services';
import { WAYBILL_QUERY_KEYS } from '@/modules/Home/constants';

interface PrintWaybillOptions {
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
}

/**
 * Hook to print a waybill using TanStack Query
 * Automatically invalidates waybill list on success
 * Supports callbacks for UI feedback during printing
 * @returns Mutation object with state and mutate function
 */
export const usePrintWaybill = (options?: PrintWaybillOptions) => {
  const queryClient = useQueryClient();

  const {
    mutate,
    mutateAsync,
    isPending,
    isError,
    error,
    data,
    reset,
  } = useMutation<
    WaybillsResponse,
    Error,
    string | number
  >({
    mutationFn: (waybillId) => {
      // Trigger callback when print starts
      options?.onPrintStart?.();
      return waybillService.printWaybill(waybillId);
    },
    
    onSuccess: () => {
      // Invalidate the waybill list query to refetch data
      queryClient.invalidateQueries({
        queryKey: [WAYBILL_QUERY_KEYS.waybills],
      });
      // Trigger callback after successful print
      options?.onPrintComplete?.();
    },
    
    onError: (error: Error) => {
      console.error('Failed to print waybill:', error.message);
      // Trigger callback after error
      options?.onPrintComplete?.();
    },
  });

  const errorMessage = error instanceof Error ? error.message : null;

  return {
    // Mutation functions
    mutate,
    mutateAsync,
    
    // State
    isLoading: isPending,
    isPending,
    isError,
    error: errorMessage,
    data,
    
    // Actions
    reset,
  };
};

