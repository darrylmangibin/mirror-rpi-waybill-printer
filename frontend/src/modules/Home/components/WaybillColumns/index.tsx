import { MoreHorizontalIcon, DownloadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { WaybillPrintStatusBadge } from '@/modules/Home/components/WaybillPrintStatusBadge';
import { WaybillUrlBadge } from '@/modules/Home/components/WaybillColumns/components/WaybillUrlBadge';
import { FilePath } from '@/modules/Home/components/WaybillColumns/components/FilePath';
import { FormattedDate } from '@/components/global';
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
	onDownloadClick: (waybill: WaybillPrint) => void;
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
			<div className=' text-gray-900 text-xs'>
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
		accessorKey: 'waybill_url',
		header: 'Waybill URL',
		cell: ({ row }) => {
			const url = row.getValue('waybill_url') as string | null;
			return <WaybillUrlBadge url={url} />;
		},
	},
	{
		accessorKey: 'local_file_path',
		header: 'File Path',
		cell: ({ row }) => {
			const path = row.getValue('local_file_path') as string | null;
			return <FilePath path={path} />;
		},
	},
	{
		accessorKey: 'downloaded_at',
		header: 'Downloaded At',
		cell: ({ row }) => {
			const date = row.getValue('downloaded_at') as string | null;
			return <FormattedDate date={date} />;
		},
	},
	{
		accessorKey: 'created_at',
		header: 'Created At',
		cell: ({ row }) => {
			const date = row.getValue('created_at') as string | null;
			return <FormattedDate date={date} />;
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
							onClick={() => context.onDownloadClick(waybill)}
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
