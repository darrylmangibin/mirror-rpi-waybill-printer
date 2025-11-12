import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waybillService, type WaybillsResponse } from '@/modules/Home/services';
import { WAYBILL_QUERY_KEYS } from '@/modules/Home/constants';

interface DownloadWaybillOptions {
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
}

/**
 * Hook to download a waybill file using TanStack Query
 * Automatically invalidates waybill list on success
 * Supports callbacks to trigger polling during download
 * @returns Mutation object with state and mutate function
 */
export const useDownloadWaybill = (options?: DownloadWaybillOptions) => {
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
      // Trigger polling when download starts
      options?.onDownloadStart?.();
      return waybillService.downloadWaybill(waybillId);
    },
    
    onSuccess: () => {
      // Invalidate the waybill list query to refetch data
      queryClient.invalidateQueries({
        queryKey: [WAYBILL_QUERY_KEYS.waybills],
      });
      // Stop polling after successful download
      options?.onDownloadComplete?.();
    },
    
    onError: (error: Error) => {
      console.error('Failed to download waybill:', error.message);
      // Stop polling after error
      options?.onDownloadComplete?.();
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

