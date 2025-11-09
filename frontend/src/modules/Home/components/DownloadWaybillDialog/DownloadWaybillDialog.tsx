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

interface DownloadWaybillDialogProps {
	waybillId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm?: (waybillId: string) => void;
	showTrigger?: boolean;
}

export const DownloadWaybillDialog = ({
	waybillId,
	open,
	onOpenChange,
	onConfirm,
	showTrigger = true,
}: DownloadWaybillDialogProps) => {
	const handleConfirm = () => {
		console.log(`Downloading waybill: ${waybillId}`);
		onConfirm?.(waybillId);
		onOpenChange(false);
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

				<div className='px-4 py-4'>
					<p className='text-sm text-gray-600'>
						Waybill ID: <span className='font-semibold'>{waybillId}</span>
					</p>
				</div>

				<DialogFooter>
					<div className='flex items-center justify-end gap-2 w-full bg-gray-100 py-2 rounded-b-lg px-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<PrimaryButton onClick={handleConfirm}>
							Download
						</PrimaryButton>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

