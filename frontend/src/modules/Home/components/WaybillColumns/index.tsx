import { Checkbox } from '@/components/ui/checkbox';
import { WaybillUrlBadge } from '@/modules/Home/components/WaybillColumns/components/WaybillUrlBadge';
import { FilePath } from '@/modules/Home/components/WaybillColumns/components/FilePath';
import { StatusDropdown } from '@/modules/Home/components/WaybillColumns/components/StatusDropdown';
import { WaybillPrintActions } from '@/modules/Home/components/WaybillColumns/components/WaybillPrintActions';
import { ErrorColumn } from '@/modules/Home/components/WaybillColumns/components/ErrorColumn';
import { PlatformBadge } from '@/modules/Home/components/WaybillColumns/components/PlatformBadge';
import { PrintDetailsColumn } from '@/modules/Home/components/WaybillColumns/components/PrintDetailsColumn';
import { FormattedDate } from '@/components/global';
import { marketplaceIcons } from '@/modules/Home/constants/marketplaces';
import type { ColumnDef } from '@tanstack/react-table';
import type { WaybillPrint } from '@/modules/Home/services';

export type { WaybillPrint } from '@/modules/Home/services';

export interface WaybillColumnsContext {
	onEditClick: (waybill: WaybillPrint) => void;
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
		accessorKey: 'tenant_id',
		header: 'Platform',
		cell: ({ row }) => {
			const tenantId = row.getValue('tenant_id') as number | null;
			const marketplace = row.getValue('marketplace') as string | null;
			const icon = marketplace
				? marketplaceIcons[marketplace as keyof typeof marketplaceIcons]
				: undefined;
			return (
				<PlatformBadge
					tenantId={tenantId}
					icon={icon}
					marketplace={marketplace || undefined}
				/>
			);
		},
	},
	{
		accessorKey: 'invoice_number',
		header: 'Invoice Number',
		cell: ({ row }) => {
			const invoiceNumber = row.getValue('invoice_number') as string | null;
			const tenantId = row.original.tenant_id;

			if (!invoiceNumber) {
				return <div className='text-gray-500 text-xs'>-</div>;
			}

			const invoiceUrl = `https://${tenantId}.fusiontech.asia/dashboard/live/invoices/${invoiceNumber}`;

			return (
				<a
					href={invoiceUrl}
					target='_blank'
					rel='noopener noreferrer'
					className='text-xs text-blue-800 font-semibold transition-colors'>
					{invoiceNumber}
				</a>
			);
		},
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
		id: 'print_details',
		header: 'Print Details',
		cell: ({ row }) => {
			const printStatus = row.getValue('print_status') as string | null;
			const printerName = row.getValue('printer_name') as string | null;
			const cupsJobId = row.getValue('cups_job_id') as number | null;
			const printError = row.getValue('print_error') as string | null;
			const printCompletedAt = row.getValue('print_completed_at') as string | null;

			return (
				<PrintDetailsColumn
					printStatus={printStatus}
					printerName={printerName}
					cupsJobId={cupsJobId}
					printError={printError}
					printCompletedAt={printCompletedAt}
				/>
			);
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
					onEditClick={context.onEditClick}
					onDownloadClick={context.onDownloadClick}
					onPrintClick={context.onPrintClick}
					onDeleteClick={context.onDeleteClick}
				/>
			);
		},
	},
];
