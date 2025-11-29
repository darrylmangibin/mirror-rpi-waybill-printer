import { Checkbox } from '@/components/ui/checkbox';
import { StatusDropdown } from '@/modules/Home/components/WaybillColumns/components/StatusDropdown';
import { WaybillPrintActions } from '@/modules/Home/components/WaybillColumns/components/WaybillPrintActions';
import { PlatformBadge } from '@/modules/Home/components/WaybillColumns/components/PlatformBadge';
import { AutoPrintColumn } from '@/modules/Home/components/WaybillColumns/components/AutoPrintColumn';
import { ProgressColumn } from '@/modules/Home/components/WaybillColumns/components/ProgressColumn';
import { FormattedDate } from '@/components/global';
import { marketplaceIcons } from '@/modules/Home/constants/marketplaces';
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

			if (!invoiceNumber) {
				return <div className='text-gray-500 text-xs'>-</div>;
			}

			const invoiceUrl = `https://${tenantId}.fusiontech.asia/dashboard/live/invoices/${invoiceNumber}`;
			const displayNumber = invoiceNumber.length > 15 
				? `${invoiceNumber.substring(0, 15)}...` 
				: invoiceNumber;

			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<a
							href={invoiceUrl}
							target='_blank'
							rel='noopener noreferrer'
							className='text-xs text-blue-800 font-semibold transition-colors hover:underline'>
							{displayNumber}
						</a>
					</TooltipTrigger>
					<TooltipContent>
						<div className='max-w-xs break-all'>{invoiceNumber}</div>
					</TooltipContent>
				</Tooltip>
			);
		},
		size: 150,
		minSize: 120,
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
		accessorKey: 'auto_print',
		header: 'Auto Print',
		cell: ({ row }) => {
			const autoPrint = row.original.auto_print;
			return <AutoPrintColumn autoPrint={autoPrint} />;
		},
		size: 110,
		minSize: 100,
	},
	{
		id: 'progress',
		header: 'Progress',
		cell: ({ row }) => <ProgressColumn waybill={row.original as Partial<WaybillPrint>} />,
		size: 140,
		minSize: 120,
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
