import { DownloadIcon, ExternalLink } from 'lucide-react';
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

		<div className='px-5 py-3 space-y-2.5'>
			{invoiceNumber && (
			<div className='bg-gray-50 rounded-md p-2.5 border border-gray-200'>
				<p className='text-xs font-semibold text-gray-600 mb-0.5'>Invoice Number</p>
					<p className='text-sm font-bold text-gray-900'>{invoiceNumber}</p>
				</div>
			)}
			
		{waybillUrl && (
			<div className='bg-gray-50 rounded-md p-2.5 border border-gray-200'>
				<p className='text-xs font-semibold text-gray-600 mb-0.5'>Waybill URL</p>
				<button
					type='button'
					onClick={() => {
						if (waybillUrl) window.open(waybillUrl, '_blank');
					}}
					className='flex items-center gap-2 text-xs text-gray-700 hover:text-gray-900 hover:underline cursor-pointer break-all font-mono leading-snug transition-colors group w-full'>
					<span>{waybillUrl}</span>
					<ExternalLink className='w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity' />
				</button>
			</div>
		)}

			{isError && (
				<div className='bg-red-50 border border-red-200 rounded-md p-2.5'>
					<p className='text-xs font-medium text-red-700'>
						{error || 'An error occurred during download'}
					</p>
				</div>
			)}
		</div>

		<DialogFooter>
			<div className='flex items-center justify-end gap-2 w-full bg-gray-50 border-t border-gray-200 py-3 px-5 rounded-b-lg'>
				<Button
					type='button'
					variant='outline'
					onClick={() => onOpenChange(false)}
					disabled={isPending}
					className='font-medium text-xs h-8'>
					Cancel
				</Button>
				<PrimaryButton 
					onClick={handleConfirm}
					disabled={isPending}
					className='font-medium text-xs h-8'>
					{isPending ? (
						<span className='flex items-center gap-1.5'>
							<div className='w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
							Downloading
						</span>
					) : (
						<span className='flex items-center gap-1.5'>
							<DownloadIcon className='w-3.5 h-3.5' />
							Download
						</span>
					)}
				</PrimaryButton>
			</div>
		</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

