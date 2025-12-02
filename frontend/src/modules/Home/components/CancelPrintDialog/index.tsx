import { XCircleIcon } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
} from '@/components/ui/dialog';
import { DialogHeaderComponent } from '@/components/global/components/DialogHeader';
import PrimaryButton from '@/components/global/components/buttons/PrimaryButton';
import { Button } from '@/components/ui/button';
import type { WaybillPrint } from '@/modules/Home/services';

interface CancelPrintDialogProps {
	waybill: WaybillPrint | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm?: (waybill: WaybillPrint) => void;
	isLoading?: boolean;
}

export const CancelPrintDialog = ({
	waybill,
	open,
	onOpenChange,
	onConfirm,
	isLoading = false,
}: CancelPrintDialogProps) => {
	if (!waybill) return null;

	const handleConfirm = () => {
		onConfirm?.(waybill);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className='sm:max-w-md p-0 gap-0'
				showCloseButton={false}>
				<DialogHeaderComponent
					icon={
						<XCircleIcon
							strokeWidth={2}
							className='w-5 h-5 text-red-600'
						/>
					}
					title='Cancel Print Job'
					description='Are you sure you want to cancel this print job?'
				/>

				<div className='px-5 py-3 space-y-2.5'>
					<div className='bg-red-50 rounded-md p-2.5 border border-red-200'>
						<p className='text-xs font-semibold text-red-600 mb-0.5'>
							Invoice Number
						</p>
						<p className='text-sm font-bold text-red-900'>
							{waybill.invoice_number}
						</p>
					</div>

					{waybill.cups_job_id && (
						<div className='bg-gray-50 rounded-md p-2.5 border border-gray-200'>
							<p className='text-xs font-semibold text-gray-600 mb-0.5'>
								CUPS Job ID
							</p>
							<p className='text-sm font-mono text-gray-900'>
								{waybill.cups_job_id}
							</p>
						</div>
					)}

					<div className='bg-amber-50 rounded-md p-2.5 border border-amber-200'>
						<p className='text-xs font-semibold text-amber-700 mb-1'>
							⚠️ This action will:
						</p>
						<ul className='text-xs text-amber-700 space-y-0.5 list-disc list-inside'>
							<li>Cancel the active print job</li>
							<li>Stop the printer from processing</li>
							<li>Update the waybill status to error</li>
						</ul>
					</div>
				</div>

				<DialogFooter>
					<div className='flex items-center justify-end gap-2 w-full bg-gray-50 border-t border-gray-200 py-3 px-5 rounded-b-lg'>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
							className='font-medium text-xs h-8'>
							Keep Printing
						</Button>
						<PrimaryButton
							onClick={handleConfirm}
							disabled={isLoading}
							className='font-medium text-xs h-8 bg-red-600 hover:bg-red-700'>
							<span className='flex items-center gap-1.5'>
								<XCircleIcon className='w-3.5 h-3.5' />
								{isLoading ? 'Cancelling...' : 'Cancel Print'}
							</span>
						</PrimaryButton>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

