import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waybillService, type WaybillsResponse } from '@/modules/Home/services';
import { WAYBILL_QUERY_KEYS } from '@/modules/Home/constants';

/**
 * Hook to create a new waybill print using TanStack Query
 * Automatically invalidates waybill list on success
 * @returns Mutation object with state and mutate function
 */
export const useCreateWaybillPrint = () => {
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
    { invoiceNumber: string; waybillUrl: string }
  >({
    mutationFn: ({ invoiceNumber, waybillUrl }) =>
      waybillService.createWaybillPrint(invoiceNumber, waybillUrl),
    
    onSuccess: () => {
      // Invalidate the waybill list query to refetch data
      queryClient.invalidateQueries({
        queryKey: [WAYBILL_QUERY_KEYS.waybills],
      });
    },
    
    onError: (error: Error) => {
      console.error('Failed to create waybill print:', error.message);
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

