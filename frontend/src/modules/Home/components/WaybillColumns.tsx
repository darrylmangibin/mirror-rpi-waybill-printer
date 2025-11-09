import { MoreHorizontalIcon, DownloadIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { WaybillPrintStatusBadge } from '@/modules/Home/components/WaybillPrintStatusBadge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import type { WaybillPrint } from '@/modules/Home/services';

export type { WaybillPrint } from '@/modules/Home/services';

export interface WaybillColumnsContext {
	onDownloadClick: (waybillId: string) => void;
}

export const getWaybillColumns = (
	context: WaybillColumnsContext
): ColumnDef<WaybillPrint>[] => [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'invoice_number',
		header: 'Invoice',
		cell: ({ row }) => (
			<div className='font-medium text-gray-900'>
				{row.getValue('invoice_number')}
			</div>
		),
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.getValue('status') as string;
			return <WaybillPrintStatusBadge status={status} />;
		},
	},
	{
		accessorKey: 'downloaded_at',
		header: 'Downloaded',
		cell: ({ row }) => {
			const date = row.getValue('downloaded_at') as string | null;
			return (
				<div className='text-sm text-gray-700'>
					{date ? format(new Date(date), 'MMM d, yyyy h:mm a') : '-'}
				</div>
			);
		},
	},
	{
		accessorKey: 'local_file_path',
		header: 'File Path',
		cell: ({ row }) => {
			const path = row.getValue('local_file_path') as string | null;
			return path ? (
				<div className='text-xs text-blue-600 font-mono truncate max-w-xs'>
					{path}
				</div>
			) : (
				<div className='text-gray-500'>-</div>
			);
		},
	},
	{
		accessorKey: 'created_at',
		header: 'Created',
		cell: ({ row }) => {
			const date = row.getValue('created_at') as string;
			return (
				<div className='text-sm text-gray-700'>
					{date ? format(new Date(date), 'MMM d, yyyy h:mm a') : '-'}
				</div>
			);
		},
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => {
			const waybill = row.original;

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
							onClick={() => context.onDownloadClick(String(waybill.id))}
							className='text-gray-900 hover:bg-gray-100 p-0!'>
							<Button
								asChild
								type='button'
								variant='ghost'
								size='sm'
								className='hover:bg-transparent'>
								<div className='flex items-center justify-end gap-2'>
									<DownloadIcon className='h-4 w-4' />
									<span className='text-xs'>Download</span>
								</div>
							</Button>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
