import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waybillService, type WaybillsResponse } from '@/modules/Home/services';
import { WAYBILL_QUERY_KEYS } from '@/modules/Home/constants';

interface CleanupWaybillsParams {
	from: string;
	to: string;
}

/**
 * Hook to cleanup waybills and files within a date range using TanStack Query
 * Automatically invalidates waybill list on success
 * @returns Mutation object with state and mutate function
 */
export const useCleanupWaybills = () => {
	const queryClient = useQueryClient();

	const {
		mutate,
		mutateAsync,
		isPending,
		isError,
		error,
		reset,
	} = useMutation<WaybillsResponse, Error, CleanupWaybillsParams>({
		mutationFn: ({ from, to }) => waybillService.cleanupWaybills(from, to),

		onSuccess: () => {
			// Invalidate the waybill list query to refetch data
			queryClient.invalidateQueries({
				queryKey: [WAYBILL_QUERY_KEYS.waybills],
			});
		},

		onError: (error: Error) => {
			console.error('Failed to cleanup waybills:', error.message);
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

		// Actions
		reset,
	};
};

