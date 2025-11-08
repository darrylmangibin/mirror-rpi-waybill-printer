import { useQuery } from '@tanstack/react-query';
import { waybillService, type NetworkInfo } from '@/modules/Home/services';
import { WAYBILL_QUERY_KEYS } from '@/modules/Home/constants';

/**
 * Hook to fetch network information for print job QR endpoint
 * @returns Query state with network info (local IP and API URL)
 */
export const useGetPrintJobQREndPoint = () => {
  const {
    data: networkInfo,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<NetworkInfo>({
    queryKey: [WAYBILL_QUERY_KEYS.printJobQREndPoint],
    queryFn: () => waybillService.getPrintJobQREndPoint(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : null;

  return {
    networkInfo,
    loading,
    error: errorMessage,
    actions: {
      refetch,
    },
  };
};
