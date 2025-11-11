import { useState } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useChangeWaybillStatus } from '@/modules/Home/hooks';
import { WaybillPrintStatuses, statusLabels } from '@/modules/Home/constants/waybillStatuses';

interface StatusDropdownProps {
	waybillId: number;
	currentStatus: string;
	onStatusChanged?: (newStatus: string) => void;
}

const WAYBILL_STATUSES = Object.values(WaybillPrintStatuses);

export const StatusDropdown = ({
	waybillId,
	currentStatus,
	onStatusChanged,
}: StatusDropdownProps) => {
	const { changeStatus, isLoading } = useChangeWaybillStatus();
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	const handleStatusChange = async (newStatus: string) => {
		if (newStatus === currentStatus) return;

		try {
			await changeStatus(waybillId, newStatus);
			setFeedback({ type: 'success', message: 'Status updated!' });
			onStatusChanged?.(newStatus);
			setTimeout(() => setFeedback(null), 3000);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to change status';
			setFeedback({ type: 'error', message: errorMessage });
			setTimeout(() => setFeedback(null), 3000);
		}
	};

	return (
		<div className='flex flex-col gap-1'>
			<Select
				value={currentStatus}
				onValueChange={handleStatusChange}
				disabled={isLoading}>
				<SelectTrigger className='w-fit min-w-fit h-7! text-xs px-2! py-0! focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg cursor-pointer'>
					<SelectValue placeholder='Select status' />
				</SelectTrigger>
				<SelectContent className='bg-white border-gray-200 text-xs'>
					{WAYBILL_STATUSES.map((status) => (
						<SelectItem
							key={status}
							value={status}
							className='text-gray-900 cursor-pointer text-xs'>
							{statusLabels[status as keyof typeof statusLabels]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{feedback && (
				<div
					className={`text-xs px-2 py-1 rounded ${
						feedback.type === 'success'
							? 'bg-green-50 text-green-700 border border-green-200'
							: 'bg-red-50 text-red-700 border border-red-200'
					}`}>
					{feedback.message}
				</div>
			)}
		</div>
	);
};

