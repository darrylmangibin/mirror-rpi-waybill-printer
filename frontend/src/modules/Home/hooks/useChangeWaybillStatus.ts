import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { WAYBILL_ENDPOINTS } from '@/modules/Home/services/endpoints';
import { WAYBILL_QUERY_KEYS } from '@/modules/Home/constants/waybillQueryKeys';

interface ChangeStatusResponse {
	status: string;
	message?: string;
}

interface ChangeStatusPayload {
	waybillId: number;
	newStatus: string;
}

export const useChangeWaybillStatus = () => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async ({ waybillId, newStatus }: ChangeStatusPayload) => {
			const response = await api.put<ChangeStatusResponse>(
				WAYBILL_ENDPOINTS.UPDATE_STATUS(waybillId),
				{ status: newStatus }
			);
			return response.data;
		},
		onSuccess: () => {
			// Invalidate waybills query to refetch with updated status
			// Use exact: false to invalidate all queries with this key prefix
			queryClient.invalidateQueries({ 
				queryKey: [WAYBILL_QUERY_KEYS.waybills],
				exact: false,
			});
		},
	});

	return {
		changeStatus: (waybillId: number, newStatus: string) =>
			mutation.mutateAsync({ waybillId, newStatus }),
		isLoading: mutation.isPending,
		error: mutation.error,
		data: mutation.data,
	};
};

