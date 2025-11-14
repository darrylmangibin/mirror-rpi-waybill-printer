import { Checkbox } from '@/components/ui/checkbox';
import { WaybillUrlBadge } from '@/modules/Home/components/WaybillColumns/components/WaybillUrlBadge';
import { FilePath } from '@/modules/Home/components/WaybillColumns/components/FilePath';
import { StatusDropdown } from '@/modules/Home/components/WaybillColumns/components/StatusDropdown';
import { WaybillPrintActions } from '@/modules/Home/components/WaybillColumns/components/WaybillPrintActions';
import { ErrorColumn } from '@/modules/Home/components/WaybillColumns/components/ErrorColumn';
import { FormattedDate } from '@/components/global';
import type { ColumnDef } from '@tanstack/react-table';
import type { WaybillPrint } from '@/modules/Home/services';

export type { WaybillPrint } from '@/modules/Home/services';

export interface WaybillColumnsContext {
	onDownloadClick: (waybill: WaybillPrint) => void;
	onPrintClick: (waybill: WaybillPrint) => void;
	onDeleteClick: (waybill: WaybillPrint) => void;
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
		accessorKey: 'tenant_id',
		header: 'Tenant ID',
		cell: ({ row }) => (
			<div className='text-gray-900 text-xs'>
				{row.getValue('tenant_id')}
			</div>
		),
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.getValue('status') as string;
			const waybillId = row.original.id;
			return (
				<StatusDropdown
					waybillId={waybillId}
					currentStatus={status}
					onStatusChanged={(newStatus) => {
						row.original.status = newStatus as typeof row.original.status;
					}}
				/>
			);
		},
	},
	{
		accessorKey: 'error_message',
		header: 'Error',
		cell: ({ row }) => {
			const errorMessage = row.getValue('error_message') as string | null;
			return <ErrorColumn errorMessage={errorMessage} />;
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
			<WaybillPrintActions
				waybill={waybill}
				onDownloadClick={context.onDownloadClick}
				onPrintClick={context.onPrintClick}
				onDeleteClick={context.onDeleteClick}
			/>
		);
		},
	},
];
