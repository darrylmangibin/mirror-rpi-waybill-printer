import { AlertTriangleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import type { WaybillPrint } from '@/modules/Home/services';

interface DeleteConfirmationDialogProps {
	waybill: WaybillPrint | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (waybill: WaybillPrint) => void;
	isLoading?: boolean;
}

export const DeleteConfirmationDialog = ({
	waybill,
	open,
	onOpenChange,
	onConfirm,
	isLoading = false,
}: DeleteConfirmationDialogProps) => {
	if (!waybill) return null;

	const handleConfirm = () => {
		onConfirm(waybill);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='bg-white border-gray-200'>
				<DialogHeader>
					<div className='flex items-center gap-3'>
						<AlertTriangleIcon className='h-6 w-6 text-red-600 shrink-0' />
						<DialogTitle className='text-gray-900'>Delete Waybill?</DialogTitle>
					</div>
					<DialogDescription className='text-gray-600 pt-2'>
						Are you sure you want to delete waybill{' '}
						<span className='font-semibold text-gray-900'>
							{waybill.invoice_number || `#${waybill.id}`}
						</span>
						? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>

				<div className='flex justify-end gap-3 pt-4'>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
						className='text-gray-900 border-gray-200 hover:bg-gray-100'>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={isLoading}
						className='bg-red-600 hover:bg-red-700 text-white'>
						{isLoading ? 'Deleting...' : 'Delete'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

