import { AlertTriangleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
} from '@/components/ui/dialog';
import { DialogHeaderComponent } from '@/components/global/components/DialogHeader';
import DangerButton from '@/components/global/components/buttons/DangerButton';
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
			<DialogContent
				className='sm:max-w-md p-0 gap-0'
				showCloseButton={false}>
				<DialogHeaderComponent
					icon={
						<AlertTriangleIcon
							strokeWidth={2}
							className='w-5 h-5 text-red-600'
						/>
					}
					title='Delete Waybill?'
					description={`Are you sure you want to delete waybill ${
						waybill.invoice_number || `#${waybill.id}`
					}? This action cannot be undone.`}
					variant='danger'
				/>

				<DialogFooter>
					<div className='flex items-center justify-end gap-2 w-full bg-gray-50 border-t border-gray-200 py-3 px-5 rounded-b-lg'>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
							className='font-medium text-xs h-8'>
							Cancel
						</Button>
				<DangerButton
					onClick={handleConfirm}
					disabled={isLoading}
					className='font-medium text-xs h-8'>
					{isLoading ? (
						<span className='flex items-center gap-1.5'>
							<div className='w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
							Deleting
						</span>
					) : (
						'Delete'
					)}
				</DangerButton>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

