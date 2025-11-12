import { PrinterIcon } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
} from '@/components/ui/dialog';
import { DialogHeaderComponent } from '@/components/global/components/DialogHeader';
import PrimaryButton from '@/components/global/components/buttons/PrimaryButton';
import { Button } from '@/components/ui/button';
import type { WaybillPrint } from '@/modules/Home/services';

interface PrintWaybillDialogProps {
	waybill: WaybillPrint | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm?: (waybill: WaybillPrint) => void;
}

export const PrintWaybillDialog = ({
	waybill,
	open,
	onOpenChange,
	onConfirm,
}: PrintWaybillDialogProps) => {
	if (!waybill) return null;

	const handleConfirm = () => {
		onConfirm?.(waybill);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className='sm:max-w-md p-0 gap-0'
				showCloseButton={false}>
				<DialogHeaderComponent
					icon={
						<PrinterIcon
							strokeWidth={2}
							className='w-5 h-5 text-violet-600'
						/>
					}
					title='Print Waybill'
					description='Are you sure you want to print this waybill?'
				/>

				<div className='px-5 py-3 space-y-2.5'>
					<div className='bg-gray-50 rounded-md p-2.5 border border-gray-200'>
						<p className='text-xs font-semibold text-gray-600 mb-0.5'>
							Invoice Number
						</p>
						<p className='text-sm font-bold text-gray-900'>
							{waybill.invoice_number}
						</p>
					</div>
				</div>

				<DialogFooter>
					<div className='flex items-center justify-end gap-2 w-full bg-gray-50 border-t border-gray-200 py-3 px-5 rounded-b-lg'>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							className='font-medium text-xs h-8'>
							Cancel
						</Button>
						<PrimaryButton
							onClick={handleConfirm}
							className='font-medium text-xs h-8'>
							<span className='flex items-center gap-1.5'>
								<PrinterIcon className='w-3.5 h-3.5' />
								Print
							</span>
						</PrimaryButton>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

