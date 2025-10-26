import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { waybillService, type WaybillPrint, type PaginatedWaybillsResponse } from '@/modules/Home/services';

/**
 * Hook to fetch paginated waybill prints using TanStack Query
 * @param initialPage - Initial page number (default: 1)
 * @param initialPerPage - Items per page (default: 10)
 * @returns Query state and pagination methods
 */
export const useGetWaybillPrints = (initialPage: number = 1, initialPerPage: number = 10) => {
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);

  const {
    data: response,
    isLoading,
    error,
    isFetching,
    isPending,
    refetch,
  } = useQuery<PaginatedWaybillsResponse>({
    queryKey: ['waybills', page, perPage],
    queryFn: () => waybillService.getWaybillPrints(page, perPage),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const waybills: WaybillPrint[] = response?.data || [];
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : null;

  const goToPage = (newPage: number) => {
    const totalPages = response?.total_pages || 1;
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(validPage);
  };

  const changePerPage = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1); // Reset to first page when changing per_page
  };

  return {
    waybills,
    loading: isLoading || isPending,
    fetching: isFetching,
    error: errorMessage,
    pagination: {
      page,
      perPage,
      total: response?.total || 0,
      totalPages: response?.total_pages || 0,
    },
    actions: {
      goToPage,
      changePerPage,
      refetch,
    },
  };
};
