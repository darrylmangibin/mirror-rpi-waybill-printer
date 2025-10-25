import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/global/components/DataTable';
import { TopNavbar } from '@/components/global/components/TopNavbar';

export type WaybillPrint = {
	id: number;
	created_at: string;
	updated_at: string;
	invoice_number: string;
	waybill_url: string;
	status: 'pending' | 'downloaded' | 'failed';
	local_file_path: string | null;
	error_message: string | null;
	downloaded_at: string | null;
};

// Mock data for demonstration
const mockWaybills: WaybillPrint[] = [
	{
		id: 1,
		created_at: '2025-10-25 10:30:00',
		updated_at: '2025-10-25 10:35:00',
		invoice_number: 'INV-2025-001',
		waybill_url: 'https://example.com/waybill/001',
		status: 'downloaded',
		local_file_path: '/storage/waybills/INV-2025-001.pdf',
		error_message: null,
		downloaded_at: '2025-10-25 10:35:00',
	},
	{
		id: 2,
		created_at: '2025-10-25 11:00:00',
		updated_at: '2025-10-25 11:02:00',
		invoice_number: 'INV-2025-002',
		waybill_url: 'https://example.com/waybill/002',
		status: 'downloaded',
		local_file_path: '/storage/waybills/INV-2025-002.pdf',
		error_message: null,
		downloaded_at: '2025-10-25 11:02:00',
	},
	{
		id: 3,
		created_at: '2025-10-25 11:15:00',
		updated_at: '2025-10-25 11:15:00',
		invoice_number: 'INV-2025-003',
		waybill_url: 'https://example.com/waybill/003',
		status: 'pending',
		local_file_path: null,
		error_message: null,
		downloaded_at: null,
	},
	{
		id: 4,
		created_at: '2025-10-25 11:30:00',
		updated_at: '2025-10-25 11:31:00',
		invoice_number: 'INV-2025-004',
		waybill_url: 'https://example.com/waybill/004',
		status: 'failed',
		local_file_path: null,
		error_message: 'Connection timeout while downloading waybill',
		downloaded_at: null,
	},
	{
		id: 5,
		created_at: '2025-10-25 11:45:00',
		updated_at: '2025-10-25 11:50:00',
		invoice_number: 'INV-2025-005',
		waybill_url: 'https://example.com/waybill/005',
		status: 'downloaded',
		local_file_path: '/storage/waybills/INV-2025-005.pdf',
		error_message: null,
		downloaded_at: '2025-10-25 11:50:00',
	},
];

function getStatusBadge(status: string) {
	switch (status) {
		case 'downloaded':
			return 'bg-green-500/20 text-green-400 border border-green-500/30';
		case 'pending':
			return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
		case 'failed':
			return 'bg-red-500/20 text-red-400 border border-red-500/30';
		default:
			return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
	}
}

export const waybillColumns: ColumnDef<WaybillPrint>[] = [
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
		accessorKey: 'id',
		header: 'ID',
		cell: ({ row }) => <div>#{row.getValue('id')}</div>,
	},
	{
		accessorKey: 'invoice_number',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className='hover:bg-gray-100'>
					Invoice
					<ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			);
		},
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
			return (
				<div className='flex items-center'>
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
							status
						)}`}>
						{status}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: 'created_at',
		header: 'Created',
		cell: ({ row }) => (
			<div className='text-sm text-gray-700'>{row.getValue('created_at')}</div>
		),
	},
	{
		accessorKey: 'downloaded_at',
		header: 'Downloaded',
		cell: ({ row }) => (
			<div className='text-sm text-gray-700'>
				{(row.getValue('downloaded_at') as string) || '-'}
			</div>
		),
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
							<MoreHorizontal className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align='end'
						className='bg-white border-gray-200'>
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() =>
								navigator.clipboard.writeText(waybill.invoice_number)
							}
							className='text-gray-900 hover:bg-gray-100'>
							Copy invoice number
						</DropdownMenuItem>
						<DropdownMenuSeparator className='bg-gray-200' />
						<DropdownMenuItem className='text-gray-900 hover:bg-gray-100'>
							View details
						</DropdownMenuItem>
						<DropdownMenuItem className='text-red-600 hover:bg-red-50'>
							Delete waybill
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
const Home = () => {
	const handleRowsSelected = (rows: WaybillPrint[]) => {
		console.log('Selected rows:', rows);
	};

	return (
		<>
			{/* Top Navigation Bar */}
			<TopNavbar />

			{/* Main Content */}
			<div className='max-w-7xl mx-auto px-6 py-8'>
				{/* Page Header */}
				<div className='mb-8'>
					<div className='flex items-center justify-between mb-2'>
						<div>
							<h2 className='text-3xl font-bold text-gray-900'>Waybill Prints</h2>
							<p className='text-gray-600 mt-1'>
								Manage and track all your waybill printing requests
							</p>
						</div>
						<Button className='bg-blue-600 hover:bg-blue-700 text-white'>
							+ Add Waybill
						</Button>
					</div>
				</div>

				{/* Data Table */}
				<div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
					<DataTable
						columns={waybillColumns}
						data={mockWaybills}
						searchPlaceholder='Search by invoice number...'
						searchColumn='invoice_number'
						pageSize={10}
						onRowsSelected={handleRowsSelected}
					/>
				</div>
			</div>
		</>
	);
};

export default Home;
