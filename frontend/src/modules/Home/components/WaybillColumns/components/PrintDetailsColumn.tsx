import { FormattedDate } from '@/components/global';
import { ClockIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';
import type { WaybillPrint } from '@/modules/Home/services';
import { PrintStatuses, printStatusLabels, printStatusGradients, type PrintStatus } from '@/modules/Home/constants';
import { getPrintStatusIcon } from '@/modules/Home/utils';

interface PrintDetailsColumnProps {
	waybill: Partial<WaybillPrint>;
}

export const PrintDetailsColumn = ({
	waybill,
}: PrintDetailsColumnProps) => {
	const { 
		print_status: printStatus = null, 
		cups_job_id: cupsJobId = null, 
		print_error: printError = null, 
		print_completed_at: printCompletedAt = null 
	} = waybill;

	const statusDisplay = printStatus && (printStatus as PrintStatus) in printStatusLabels 
		? printStatusLabels[printStatus as PrintStatus]
		: printStatusLabels[PrintStatuses.IDLE];

	const getStatusGradientClass = (status: string | null) => {
		if (status && (status as PrintStatus) in printStatusGradients) {
			return printStatusGradients[status as PrintStatus];
		}
		return printStatusGradients[PrintStatuses.IDLE];
	};

	if (!cupsJobId && !printCompletedAt && !printError) {
		return (
			<div className='space-y-1'>
				<Badge variant='outline' className={cn('rounded-full', getStatusGradientClass(printStatus))}>
					<span className='flex items-center gap-1'>
						{getPrintStatusIcon(printStatus as PrintStatus)}
						{statusDisplay}
					</span>
				</Badge>
				<div className='text-gray-500 text-xs'>-</div>
			</div>
		);
	}

	return (
		<div className='space-y-1.5'>
			{/* Status Badge - Top Line */}
			<div className='flex items-center gap-1.5'>
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge variant='outline' className={cn('rounded-full cursor-pointer', getStatusGradientClass(printStatus))}>
							<span className='flex items-center gap-1'>
								{getPrintStatusIcon(printStatus as PrintStatus)}
								{statusDisplay}
							</span>
						</Badge>
					</TooltipTrigger>
					<TooltipContent className={printError ? 'max-w-xs break-all' : ''}>
						<div className='space-y-1'>
							{cupsJobId && <div>Job ID: {cupsJobId}</div>}
							{printError && <div>{printError}</div>}
						</div>
					</TooltipContent>
				</Tooltip>
			</div>

			{/* Completed At - Bottom */}
			{printCompletedAt && (
				<div className='flex items-center gap-1.5 text-xs text-gray-400'>
					<ClockIcon className='w-3.5 h-3.5 text-gray-600' />
					<FormattedDate date={printCompletedAt} />
				</div>
			)}
		</div>
	);
};

