import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waybillService, type WaybillsResponse } from '@/modules/Home/services';
import { WAYBILL_QUERY_KEYS } from '@/modules/Home/constants';

interface CancelPrintWaybillOptions {
  onCancelStart?: () => void;
  onCancelComplete?: () => void;
}

/**
 * Hook to cancel a print job by waybill ID using TanStack Query
 * Used by the UI table for direct cancellation
 * Automatically invalidates waybill list on success
 * Supports callbacks for UI feedback during cancellation
 * @returns Mutation object with state and mutate function
 */
export const useCancelPrintWaybill = (options?: CancelPrintWaybillOptions) => {
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
      // Trigger callback when cancel starts
      options?.onCancelStart?.();
      return waybillService.cancelPrintWaybill(waybillId);
    },
    
    onSuccess: () => {
      // Invalidate the waybill list query to refetch data
      queryClient.invalidateQueries({
        queryKey: [WAYBILL_QUERY_KEYS.waybills],
      });
      // Trigger callback after successful cancel
      options?.onCancelComplete?.();
    },
    
    onError: (error: Error) => {
      console.error('Failed to cancel print:', error.message);
      // Trigger callback after error
      options?.onCancelComplete?.();
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
