import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import PrimaryButton from '@/components/global/components/buttons/PrimaryButton';
import { DialogHeaderComponent } from '@/components/global/components/DialogHeader';
import { cn } from '@/lib';
import { Button } from '@/components/ui/button';

interface ManualCreatePrintJobDialogProps {
	onSubmit?: (invoiceNumber: string, url: string) => Promise<void>;
}

export const ManualCreatePrintJobDialog = ({ onSubmit }: ManualCreatePrintJobDialogProps) => {
	const [open, setOpen] = useState(false);
	const [invoiceNumber, setInvoiceNumber] = useState('');
	const [url, setUrl] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			// Reset form when closing
			setInvoiceNumber('');
			setUrl('');
			setError(null);
		}
	};

	const handleSubmit = async () => {
		setError(null);

		if (!invoiceNumber.trim() || !url.trim()) {
			setError('Please fill in all fields');
			return;
		}

		// Basic URL validation
		try {
			new URL(url);
		} catch {
			setError('Please enter a valid URL');
			return;
		}

		setLoading(true);
		try {
			if (onSubmit) {
				await onSubmit(invoiceNumber, url);
			}
			setOpen(false);
			setInvoiceNumber('');
			setUrl('');
			setError(null);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to create print job';
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<div className='flex flex-col gap-1'>
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<Button
									size='sm'
									type='button'
									variant='outline'
									className={cn(
										'active:scale-95 focus:outline-none focus:ring-0 rounded-lg gap-2'
									)}>
									<PlusIcon className='w-4 h-4' />
									<span>Manually</span>
								</Button>
							</div>
						</TooltipTrigger>
						<TooltipContent className='bg-gray-900 text-white border-0 max-w-xs'>
							<p className='text-xs'>
								Click to manually create a print job with invoice number and URL
							</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</DialogTrigger>
			<DialogContent
				className='sm:max-w-md p-0 gap-0'
				showCloseButton={false}>
				<DialogHeaderComponent
					icon={
						<PlusIcon
							strokeWidth={2}
							className='w-5 h-5 text-violet-600'
						/>
					}
					title='Create Print Job'
					description='Enter invoice number and URL to create a print job'
				/>

				<div className='px-4 py-4 space-y-4'>
					{error && (
						<div className='bg-red-50 border border-red-200 rounded p-3'>
							<p className='text-sm text-red-600'>{error}</p>
						</div>
					)}

					<div className='space-y-2'>
						<label className='block text-sm font-medium text-gray-900'>
							Invoice Number
						</label>
						<input
							type='text'
							value={invoiceNumber}
							onChange={(e) => setInvoiceNumber(e.target.value)}
							placeholder='Enter invoice number'
							disabled={loading}
							className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:bg-gray-100'
						/>
					</div>

					<div className='space-y-2'>
						<label className='block text-sm font-medium text-gray-900'>
							URL
						</label>
						<input
							type='url'
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder='Enter URL to print'
							disabled={loading}
							className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:bg-gray-100'
						/>
					</div>
				</div>

				<DialogFooter>
					<div className='flex items-center justify-end gap-2 w-full bg-gray-100 py-2 rounded-b-lg px-4'>
						<Button
              type='button'
              variant='outline'
							onClick={() => setOpen(false)}
							disabled={loading}>
							Cancel
						</Button>
						<PrimaryButton
							onClick={handleSubmit}
							disabled={loading}>
							{loading ? 'Creating...' : 'Create'}
						</PrimaryButton>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

