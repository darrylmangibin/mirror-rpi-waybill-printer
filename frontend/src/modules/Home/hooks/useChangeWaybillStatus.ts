import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ChangeStatusResponse {
	status: string;
	message?: string;
}

interface ChangeStatusPayload {
	waybillId: number;
	newStatus: string;
}

export const useChangeWaybillStatus = () => {
	const mutation = useMutation({
		mutationFn: async ({ waybillId, newStatus }: ChangeStatusPayload) => {
			const response = await api.put<ChangeStatusResponse>(
				`/waybills/prints/${waybillId}/status`,
				{ status: newStatus }
			);
			return response.data;
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

