import { DownloadIcon } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';
import PrimaryButton from '@/components/global/components/buttons/PrimaryButton';
import { DialogHeaderComponent } from '@/components/global/components/DialogHeader';
import { cn } from '@/lib';
import { Button } from '@/components/ui/button';
import { useDownloadWaybill } from '@/modules/Home/hooks';

interface DownloadWaybillDialogProps {
	waybillId: string;
	invoiceNumber?: string | null;
	waybillUrl?: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm?: (waybillId: string) => void;
	showTrigger?: boolean;
}

export const DownloadWaybillDialog = ({
	waybillId,
	invoiceNumber,
	waybillUrl,
	open,
	onOpenChange,
	onConfirm,
	showTrigger = true,
}: DownloadWaybillDialogProps) => {
	const { mutateAsync, isPending, isError, error } = useDownloadWaybill();

	const handleConfirm = async () => {
		try {
			await mutateAsync(waybillId);
			onConfirm?.(waybillId);
			onOpenChange(false);
		} catch (err) {
			console.error('Download failed:', err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{showTrigger && (
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
										<DownloadIcon className='w-4 h-4' />
										<span>Download</span>
									</Button>
								</div>
							</TooltipTrigger>
							<TooltipContent className='bg-gray-900 text-white border-0 max-w-xs'>
								<p className='text-xs'>
									Click to download the waybill
								</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</DialogTrigger>
			)}
			<DialogContent
				className='sm:max-w-md p-0 gap-0'
				showCloseButton={false}>
				<DialogHeaderComponent
					icon={
						<DownloadIcon
							strokeWidth={2}
							className='w-5 h-5 text-violet-600'
						/>
					}
					title='Download Waybill'
					description='Are you sure you want to download this waybill?'
				/>

			<div className='px-4 py-4 space-y-3'>
				{invoiceNumber && (
					<div>
						<p className='text-xs text-gray-500 mb-1'>Invoice Number</p>
						<p className='text-sm font-semibold text-gray-900'>{invoiceNumber}</p>
					</div>
				)}
				
				{waybillUrl && (
					<div>
						<p className='text-xs text-gray-500 mb-1'>Waybill URL</p>
						<p className='text-sm text-blue-600 font-mono truncate hover:text-blue-800 cursor-pointer' 
							title={waybillUrl}
							onClick={() => {
								if (waybillUrl) navigator.clipboard.writeText(waybillUrl);
							}}>
							{waybillUrl}
						</p>
					</div>
				)}

				{isError && (
					<div className='bg-red-50 border border-red-200 rounded p-3 mt-3'>
						<p className='text-sm text-red-700'>
							{error || 'An error occurred during download'}
						</p>
					</div>
				)}
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
							onClick={handleConfirm}
							disabled={isPending}>
							{isPending ? 'Downloading...' : 'Download'}
						</PrimaryButton>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

