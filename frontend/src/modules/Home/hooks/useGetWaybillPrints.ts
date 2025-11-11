import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { waybillService, type WaybillPrint, type PaginatedWaybillsResponse } from '@/modules/Home/services';
import { WAYBILL_QUERY_KEYS } from '@/modules/Home/constants';

const PER_PAGE = 10;
const PAGE = 1;

/**
 * Hook to fetch paginated waybill prints using TanStack Query
 * Supports polling to refresh data at intervals
 * @param initialPage - Initial page number (default: 1)
 * @param enablePolling - Enable polling for real-time updates (default: false)
 * @param pollInterval - Polling interval in milliseconds (default: 2000ms)
 * @returns Query state and pagination methods
 */
export const useGetWaybillPrints = (enablePolling = false, pollInterval = 2000) => {
  const [page, setPage] = useState<number>(PAGE);
  const perPage = PER_PAGE;
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
		data: response,
		isLoading,
		error,
		isFetching,
		isPending,
		refetch,
	} = useQuery<PaginatedWaybillsResponse>({
		queryKey: [WAYBILL_QUERY_KEYS.waybills, page],
		queryFn: () => waybillService.getWaybillPrints(page, perPage),
		staleTime: 0, // Always consider data stale for real-time updates
		gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
		retry: 2,
		retryDelay: (attemptIndex: number) =>
			Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchInterval: false, // Disabled - we use manual polling below
	});

	// Handle manual polling with dynamic intervals
	useEffect(() => {
		// Clear existing interval
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}

		if (enablePolling) {
			// Immediately refetch first time
			refetch();
			
			// Then set up interval for subsequent fetches
			pollingIntervalRef.current = setInterval(() => {
				refetch();
			}, pollInterval);
		}

		// Cleanup on unmount or when polling is disabled
		return () => {
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
				pollingIntervalRef.current = null;
			}
		};
	}, [enablePolling, pollInterval, refetch]);

  const waybills: WaybillPrint[] = response?.data || [];
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : null;

  // Extract pagination from API response
  // The API returns pagination data in a nested 'pagination' object with 'last_page' field
  const paginationData = (response as any)?.pagination || {};
  const totalFromResponse = response?.total || paginationData.total || 0;
  const totalPagesFromResponse = response?.total_pages || paginationData.last_page || (totalFromResponse > 0 ? Math.ceil(totalFromResponse / perPage) : 1);

  const goToPage = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPagesFromResponse));
    setPage(validPage);
  };

  return {
    waybills,
    loading: isLoading || isPending,
    fetching: isFetching,
    error: errorMessage,
    pagination: {
      page,
      perPage,
      total: totalFromResponse,
      totalPages: totalPagesFromResponse,
    },
    actions: {
      goToPage,
      refetch,
    },
  };
};
