import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waybillService, type WaybillsResponse } from '@/modules/Home/services';
import { WAYBILL_QUERY_KEYS } from '@/modules/Home/constants';

interface EditWaybillPayload {
	waybillId: string | number;
	invoiceNumber: string;
	tenantId: string;
	waybillUrl?: string | null;
	marketplace?: string | null;
}

interface EditWaybillOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

/**
 * Hook to edit an existing waybill print using TanStack Query
 * Automatically invalidates waybill list on success
 * @returns Mutation object with state and mutate function
 */
export const useEditWaybill = (options?: EditWaybillOptions) => {
	const queryClient = useQueryClient();

	const {
		mutate,
		mutateAsync,
		isPending,
		isError,
		error,
		data,
		reset,
	} = useMutation<WaybillsResponse, Error, EditWaybillPayload>({
		mutationFn: ({ waybillId, invoiceNumber, tenantId, waybillUrl, marketplace }) =>
			waybillService.updateWaybillPrint(
				waybillId,
				invoiceNumber,
				tenantId,
				waybillUrl,
				marketplace
			),

		onSuccess: () => {
			// Invalidate the waybill list query to refetch data
			queryClient.invalidateQueries({
				queryKey: [WAYBILL_QUERY_KEYS.waybills],
			});
			// Trigger callback after successful edit
			options?.onSuccess?.();
		},

		onError: (error: Error) => {
			console.error('Failed to edit waybill print:', error.message);
			// Trigger callback after error
			options?.onError?.(error);
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

