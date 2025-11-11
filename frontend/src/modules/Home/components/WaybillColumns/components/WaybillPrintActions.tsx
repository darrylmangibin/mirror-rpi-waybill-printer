import { MoreHorizontalIcon, DownloadIcon, PrinterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WaybillPrint } from '@/modules/Home/services';

interface WaybillPrintActionsProps {
	waybill: WaybillPrint;
	onDownloadClick: (waybill: WaybillPrint) => void;
	onPrintClick: (waybill: WaybillPrint) => void;
}

export const WaybillPrintActions = ({
	waybill,
	onDownloadClick,
	onPrintClick,
}: WaybillPrintActionsProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='ghost'
					className='h-8 w-8 p-0 hover:bg-gray-100'>
					<span className='sr-only'>Open menu</span>
					<MoreHorizontalIcon className='h-4 w-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='end'
				className='bg-white border-gray-200'>
				<DropdownMenuItem
					onClick={() => onDownloadClick(waybill)}
					className='text-gray-900 hover:bg-gray-100 p-0!'>
					<Button
						asChild
						type='button'
						variant='ghost'
						size='sm'
						className='hover:bg-transparent w-full'>
						<div className='flex items-center justify-start gap-2'>
							<DownloadIcon className='h-4 w-4' />
							<span className='text-xs'>Download</span>
						</div>
					</Button>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => onPrintClick(waybill)}
					className='text-gray-900 hover:bg-gray-100 p-0!'>
					<Button
						asChild
						type='button'
						variant='ghost'
						size='sm'
						className='hover:bg-transparent w-full'>
						<div className='flex items-center justify-start gap-2'>
							<PrinterIcon className='h-4 w-4' />
							<span className='text-xs'>Print</span>
						</div>
					</Button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

