import { AlertTriangleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { DialogHeaderComponent } from '@/components/global/components/DialogHeader';
import DangerButton from '@/components/global/components/buttons/DangerButton';
import type { WaybillPrint } from '@/modules/Home/services';

interface BulkDeleteConfirmationDialogProps {
	waybills: WaybillPrint[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (waybills: WaybillPrint[]) => void;
	isLoading?: boolean;
}

export const BulkDeleteConfirmationDialog = ({
	waybills,
	open,
	onOpenChange,
	onConfirm,
	isLoading = false,
}: BulkDeleteConfirmationDialogProps) => {
	if (!waybills || waybills.length === 0) return null;

	const handleConfirm = () => {
		onConfirm(waybills);
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
					description='This action cannot be undone.'
					title='Delete Waybills?'
					variant='danger'
				/>

				<div className='px-5 py-4 mb-8'>
					<p className='text-sm text-gray-600 text-center'>
						Are you sure you want to delete{' '}
						<span className='font-semibold text-gray-900'>
							{waybills.length} waybill{waybills.length !== 1 ? 's' : ''}
						</span>
						? This action cannot be undone.
					</p>
				</div>

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
								'Delete All'
							)}
						</DangerButton>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

