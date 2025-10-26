import { useState, useEffect, useCallback } from 'react';
import { waybillService, type WaybillPrint, type PaginatedWaybillsResponse } from '@/modules/Home/services';

interface UseGetWaybillPrintsState {
  data: WaybillPrint[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Hook to fetch paginated waybill prints
 * @param initialPage - Initial page number (default: 1)
 * @param initialPerPage - Items per page (default: 10)
 * @returns State and methods to manage waybill prints fetching
 */
export const useGetWaybillPrints = (initialPage: number = 1, initialPerPage: number = 10) => {
  const [state, setState] = useState<UseGetWaybillPrintsState>({
    data: [],
    loading: false,
    error: null,
    total: 0,
    page: initialPage,
    perPage: initialPerPage,
    totalPages: 0,
  });

  const fetchWaybillPrints = useCallback(
    async (page: number, perPage: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: PaginatedWaybillsResponse = await waybillService.getWaybillPrints(
          page,
          perPage
        );

        if (response.status === 'success' && response.data) {
          setState((prev) => ({
            ...prev,
            data: response.data || [],
            total: response.total || 0,
            page: response.page || page,
            perPage: response.per_page || perPage,
            totalPages: response.total_pages || Math.ceil((response.total || 0) / perPage),
            loading: false,
          }));
        } else {
          throw new Error(response.message || response.error || 'Failed to fetch waybill prints');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    },
    []
  );

  useEffect(() => {
    fetchWaybillPrints(state.page, state.perPage);
  }, []);

  const goToPage = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, state.totalPages || 1));
    setState((prev) => ({ ...prev, page: validPage }));
    fetchWaybillPrints(validPage, state.perPage);
  }, [state.totalPages, state.perPage, fetchWaybillPrints]);

  const changePerPage = useCallback((newPerPage: number) => {
    setState((prev) => ({ ...prev, page: 1, perPage: newPerPage }));
    fetchWaybillPrints(1, newPerPage);
  }, [fetchWaybillPrints]);

  const refetch = useCallback(() => {
    fetchWaybillPrints(state.page, state.perPage);
  }, [state.page, state.perPage, fetchWaybillPrints]);

  return {
    waybills: state.data,
    loading: state.loading,
    error: state.error,
    pagination: {
      page: state.page,
      perPage: state.perPage,
      total: state.total,
      totalPages: state.totalPages,
    },
    actions: {
      goToPage,
      changePerPage,
      refetch,
    },
  };
};
