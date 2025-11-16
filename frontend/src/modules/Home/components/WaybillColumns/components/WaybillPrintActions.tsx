import {
	MoreHorizontalIcon,
	EditIcon,
	DownloadIcon,
	PrinterIcon,
	TrashIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WaybillPrint } from '@/modules/Home/services';
import { WaybillPrintStatuses } from '@/modules/Home/constants/waybillStatuses';

interface WaybillPrintActionsProps {
	waybill: WaybillPrint;
	onEditClick: (waybill: WaybillPrint) => void;
	onDownloadClick: (waybill: WaybillPrint) => void;
	onPrintClick: (waybill: WaybillPrint) => void;
	onDeleteClick: (waybill: WaybillPrint) => void;
}

export const WaybillPrintActions = ({
	waybill,
	onEditClick,
	onDownloadClick,
	onPrintClick,
	onDeleteClick,
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
				onClick={() => onEditClick(waybill)}
				className='text-gray-900 hover:bg-gray-100 p-0! transition-colors'>
				<Button
					asChild
					type='button'
					variant='ghost'
					size='sm'
					className='hover:bg-transparent w-full'>
					<div className='flex items-center justify-start gap-2'>
						<EditIcon className='h-4 w-4' />
						<span className='text-xs'>Edit</span>
					</div>
				</Button>
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={() => onDownloadClick(waybill)}
				disabled={waybill.status !== WaybillPrintStatuses.PENDING}
				className='text-gray-900 hover:bg-gray-100 p-0! disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
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
					className='text-gray-900 hover:bg-gray-100 p-0! transition-colors'>
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
				<DropdownMenuItem
					onClick={() => onDeleteClick(waybill)}
					className='p-0! transition-colors'>
					<Button
						asChild
						type='button'
						variant='ghost'
						size='sm'
						className='w-full hover:bg-red-50'>
						<div className='flex items-center justify-start gap-2'>
							<TrashIcon className='h-4 w-4 text-red-600' />
							<span className='text-xs text-red-600'>Delete</span>
						</div>
					</Button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
