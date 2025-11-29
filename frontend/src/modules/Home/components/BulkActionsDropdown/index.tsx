import {
	ChevronDownIcon,
	Trash2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WaybillPrint } from '@/modules/Home/services';

interface BulkActionsDropdownProps {
	selectedRows: WaybillPrint[];
	onBulkDelete: (rows: WaybillPrint[]) => Promise<void>;
	isLoading?: boolean;
}

export const BulkActionsDropdown = ({
	selectedRows,
	onBulkDelete,
	isLoading = false,
}: BulkActionsDropdownProps) => {
	const isDisabled = selectedRows.length === 0 || isLoading;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size='sm'
					variant='outline'
					disabled={isDisabled}
					className='gap-2 w-full md:w-fit'>
					<span>Bulk Actions</span>
					{selectedRows.length > 0 && (
						<span className='flex items-center justify-center w-4 h-4 text-[9px] font-semibold bg-purple-100 text-purple-700 rounded-full'>
							{selectedRows.length}
						</span>
					)}
					<ChevronDownIcon className='h-4 w-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='start'
				className='bg-white border-gray-200 w-48'>

				{/* Delete Action */}
				<DropdownMenuItem
					onClick={() => onBulkDelete(selectedRows)}
					disabled={isLoading}
					className='p-0! transition-colors'>
					<Button
						asChild
						type='button'
						variant='ghost'
						size='sm'
						className='w-full hover:bg-red-50 disabled:opacity-50'>
						<div className='flex items-center justify-start gap-2'>
							<Trash2Icon className='h-4 w-4 text-red-600' />
							<span className='text-xs text-red-600'>Delete All</span>
						</div>
					</Button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

