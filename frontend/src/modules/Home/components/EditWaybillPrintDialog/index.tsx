import { Edit2Icon } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
} from '@/components/ui/dialog';
import PrimaryButton from '@/components/global/components/buttons/PrimaryButton';
import { DialogHeaderComponent } from '@/components/global/components/DialogHeader';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useEditWaybillPrintForm } from './useEditWaybillPrintForm';
import { WaybillPrintForm } from '../WaybillPrintForm';
import type { WaybillPrint } from '@/modules/Home/services/waybillService';

interface EditWaybillPrintDialogProps {
	waybill: WaybillPrint;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: (invoiceNumber: string, url: string) => Promise<void>;
}

export const EditWaybillPrintDialog = ({
	waybill,
	open,
	onOpenChange,
	onSuccess,
}: EditWaybillPrintDialogProps) => {
	const { form, handleSubmit, isPending } =
		useEditWaybillPrintForm({
			waybill,
			onSuccess,
		});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-md p-0 gap-0' showCloseButton={false}>
				<DialogHeaderComponent
					icon={
						<Edit2Icon strokeWidth={2} className='w-5 h-5 text-blue-600' />
					}
					title='Edit Print Job'
					description='Update the details of this print job'
				/>

				<div className='px-4 py-3'>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className='space-y-3'>
							<WaybillPrintForm isPending={isPending} isEditing={true} />
						</form>
					</Form>
				</div>

				<DialogFooter>
					<div className='flex items-center justify-end gap-2 w-full bg-gray-100 py-2 rounded-b-lg px-4'>
					<Button
						type='button'
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isPending}>
						Cancel
					</Button>
					<PrimaryButton
						onClick={form.handleSubmit(handleSubmit)}
						disabled={isPending}>
						{isPending ? 'Saving...' : 'Update'}
					</PrimaryButton>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

