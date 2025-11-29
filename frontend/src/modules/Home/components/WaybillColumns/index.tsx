import { Checkbox } from '@/components/ui/checkbox';
import { StatusDropdown } from '@/modules/Home/components/WaybillColumns/components/StatusDropdown';
import { WaybillPrintActions } from '@/modules/Home/components/WaybillColumns/components/WaybillPrintActions';
import { PlatformBadge } from '@/modules/Home/components/WaybillColumns/components/PlatformBadge';
import { AutoPrintColumn } from '@/modules/Home/components/WaybillColumns/components/AutoPrintColumn';
import { ErrorColumn } from '@/modules/Home/components/WaybillColumns/components/ErrorColumn';
import { DownloadStatusColumn } from '@/modules/Home/components/WaybillColumns/components/DownloadStatusColumn';
import { InvoiceNumberColumn } from '@/modules/Home/components/WaybillColumns/components/InvoiceNumberColumn';
import { PrintStatusColumn } from '@/modules/Home/components/WaybillColumns/components/PrintStatusColumn';
import { FormattedDate } from '@/components/global';
import { marketplaceIcons } from '@/modules/Home/constants/marketplaces';
import { InfoIcon } from 'lucide-react';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';
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
			const tenantId = row.original.tenant_id as number | null;
			const marketplace = row.original.marketplace as string | null;
			const isNoMarketplace = marketplace === 'no_marketplace';
			
			const icon = marketplace && marketplace.toLowerCase() in marketplaceIcons
				? marketplaceIcons[marketplace.toLowerCase() as keyof typeof marketplaceIcons]
				: undefined;
			
			return (
				<PlatformBadge
					tenantId={tenantId}
					icon={icon}
					marketplace={marketplace || undefined}
					isNoMarketplace={isNoMarketplace}
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

			return <InvoiceNumberColumn invoiceNumber={invoiceNumber} tenantId={tenantId} />;
		},
		size: 200,
		minSize: 150,
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
		size: 120,
		minSize: 100,
	},
	{
		id: 'error',
		header: 'Error Message',
		cell: ({ row }) => <ErrorColumn waybill={row.original as Partial<WaybillPrint>} />,
		size: 90,
		minSize: 80,
	},
	{
		accessorKey: 'auto_print',
		header: () => (
			<div className='flex items-center justify-center gap-1'>
				<span>Auto Print</span>
				<Tooltip>
					<TooltipTrigger asChild>
						<InfoIcon className='w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help' />
					</TooltipTrigger>
					<TooltipContent>
						<div className='text-sm'>Automatically prints after download completes</div>
					</TooltipContent>
				</Tooltip>
			</div>
		),
		cell: ({ row }) => {
			const autoPrint = row.original.auto_print;
			return <AutoPrintColumn autoPrint={autoPrint} />;
		},
		size: 110,
		minSize: 100,
	},
	{
		id: 'download_status',
		header: () => (
			<div className='flex items-center justify-center'>
				<span>File</span>
			</div>
		),
		cell: ({ row }) => (
			<div className='flex items-center justify-center'>
				<DownloadStatusColumn waybill={row.original as Partial<WaybillPrint>} />
			</div>
		),
		size: 110,
		minSize: 100,
	},
	{
		id: 'print_status',
		header: 'Print',
		cell: ({ row }) => <PrintStatusColumn waybill={row.original as Partial<WaybillPrint>} />,
		size: 110,
		minSize: 100,
	},
	{
		accessorKey: 'created_at',
		header: 'Created At',
		cell: ({ row }) => {
			const date = row.getValue('created_at') as string | null;
			return <FormattedDate date={date} />;
		},
		size: 140,
		minSize: 120,
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
