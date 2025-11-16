import { FormattedDate } from '@/components/global';
import { ClockIcon, AlertCircleIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';
import type { WaybillPrint } from '@/modules/Home/services';

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

	const statusDisplay = printStatus
		? printStatus.charAt(0).toUpperCase() + printStatus.slice(1)
		: 'Idle';

	// Map status to gradient styling
	const getStatusGradientClass = (status: string | null) => {
		switch (status) {
			case 'completed':
				return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200';
			case 'error':
				return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200';
			default:
				return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200';
		}
	};

	if (!cupsJobId && !printCompletedAt && !printError) {
		return (
			<div className='space-y-1'>
				<Badge variant='outline' className={cn('rounded-full', getStatusGradientClass(printStatus))}>
					{statusDisplay}
				</Badge>
				<div className='text-gray-500 text-xs'>-</div>
			</div>
		);
	}

	return (
		<div className='space-y-1.5'>
			{/* Printer Icon + Status Badge - Top Line */}
			<div className='flex items-center gap-1.5'>
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge variant='outline' className={cn('rounded-full cursor-pointer', getStatusGradientClass(printStatus))}>
							<span className='flex items-center gap-1'>
								{statusDisplay}
								{printError && <AlertCircleIcon className='w-3.5 h-3.5 text-red-600' />}
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

