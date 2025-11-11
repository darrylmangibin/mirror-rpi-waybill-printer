import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
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

	const handleStatusChange = async (newStatus: string) => {
		if (newStatus === currentStatus) return;

		try {
			await changeStatus(waybillId, newStatus);
			toast.success('Status updated successfully!');
			onStatusChanged?.(newStatus);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to change status';
			toast.error(errorMessage);
		}
	};

	return (
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
	);
};

