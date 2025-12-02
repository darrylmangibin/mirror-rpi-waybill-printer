import { FormattedDate } from '@/components/global';
import { 
	CheckCircle2Icon,
	AlertCircleIcon,
	ClockIcon,
	Loader2Icon,
	PrinterIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import type { WaybillPrint } from '@/modules/Home/services';

interface PrintStatusColumnProps {
	waybill: Partial<WaybillPrint>;
}

export const PrintStatusColumn = ({ waybill }: PrintStatusColumnProps) => {
	const {
		print_status: printStatus = null,
		cups_job_id: cupsJobId = null,
		print_error: printError = null,
		print_completed_at: printCompletedAt = null,
	} = waybill;

	// Debug: Log the print_status value
	console.log('PrintStatusColumn - print_status:', printStatus, 'waybill:', waybill);

	const getPrintStatus = () => {
		if (printError) return { status: 'error', label: 'Failed', icon: AlertCircleIcon };
		if (printCompletedAt) return { status: 'completed', label: 'Printed', icon: CheckCircle2Icon };
		if (printStatus === 'printing') return { status: 'printing', label: 'Printing', icon: Loader2Icon };
		if (printStatus === 'pending') return { status: 'pending', label: 'Queued', icon: ClockIcon };
		return { status: 'idle', label: 'Idle', icon: PrinterIcon };
	};

	const getStatusBadgeClass = (statusVal: string) => {
		switch (statusVal) {
			case 'completed':
				return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200';
			case 'error':
				return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200';
			case 'printing':
				return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200';
			default:
				return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200';
		}
	};

	const printStatusInfo = getPrintStatus();
	const PrintIcon = printStatusInfo.icon;

	return (
		<Popover>
		<PopoverTrigger asChild>
			<Badge 
				variant='outline' 
				className={cn('rounded-full cursor-pointer', getStatusBadgeClass(printStatusInfo.status))}
			>
				<span className='flex items-center gap-1'>
					<PrintIcon className={cn(
						'w-3.5 h-3.5',
						printStatusInfo.status === 'printing' && 'animate-spin'
					)} />
					<span className='text-xs'>{printStatusInfo.label}</span>
				</span>
			</Badge>
		</PopoverTrigger>
		<PopoverContent className='w-72 p-2' side='left'>
			<div className='space-y-1.5'>
				{printCompletedAt && (
					<div className='text-xs flex items-center gap-1 text-gray-600 px-2 py-1'>
						<ClockIcon className='w-3 h-3 inline mr-1' />
						<FormattedDate date={printCompletedAt} />
					</div>
				)}

				{cupsJobId && (
					<div className='text-xs text-gray-600 px-2 py-1'>
						<span className='font-medium'>Job ID:</span> <span className='font-mono text-gray-700'>{cupsJobId}</span>
					</div>
				)}

				{!printCompletedAt && !cupsJobId && (
					<div className='text-xs text-gray-400 px-2 py-1.5 italic'>
						No details available
					</div>
				)}
			</div>
		</PopoverContent>
		</Popover>
	);
};

