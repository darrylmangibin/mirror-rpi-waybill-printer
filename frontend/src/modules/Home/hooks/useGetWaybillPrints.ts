import { useState, useEffect } from 'react';
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
		staleTime: enablePolling ? 0 : 1000 * 60 * 5, // 0ms when polling, 5 minutes otherwise
		gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
		retry: 2,
		retryDelay: (attemptIndex: number) =>
			Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchInterval: enablePolling ? pollInterval : false, // Poll when enabled
	});

	// Handle polling state changes
	useEffect(() => {
		// When polling is disabled, force a refetch to ensure we have latest data
		if (!enablePolling) {
			// Just let the staleTime handle it
		}
	}, [enablePolling]);

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
