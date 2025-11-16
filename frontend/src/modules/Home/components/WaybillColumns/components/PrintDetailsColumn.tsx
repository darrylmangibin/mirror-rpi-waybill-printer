import { FormattedDate } from '@/components/global';
import { ClockIcon, AlertCircleIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

	// Map status to badge variant
	const getStatusVariant = (status: string | null) => {
		switch (status) {
			case 'completed':
				return 'default';
			case 'error':
				return 'destructive';
			default:
				return 'outline';
		}
	};

	if (!cupsJobId && !printCompletedAt && !printError) {
		return (
			<div className='space-y-1'>
				<Badge variant={getStatusVariant(printStatus)} className='rounded-full'>
					{statusDisplay}
				</Badge>
				<div className='text-gray-500 text-xs'>-</div>
			</div>
		);
	}

	return (
		<div className='space-y-1.5'>
			{/* Job ID - Top */}
			{cupsJobId && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className='cursor-pointer'>
							<span className='text-xs text-gray-700 font-medium'>Job ID: <span className='font-mono'>{cupsJobId}</span></span>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						Job ID: {cupsJobId}
					</TooltipContent>
				</Tooltip>
			)}

			{/* Status Badge - Middle */}
			<div className='flex items-center gap-1.5'>
				<Badge variant={getStatusVariant(printStatus)} className='rounded-full'>
					{statusDisplay}
				</Badge>
				{printError && (
					<Tooltip>
						<TooltipTrigger asChild>
							<div className='cursor-pointer'>
								<AlertCircleIcon className='w-4 h-4 text-red-600' />
							</div>
						</TooltipTrigger>
						<TooltipContent className='max-w-xs break-all bg-red-50 text-red-600 border-red-200'>
							{printError}
						</TooltipContent>
					</Tooltip>
				)}
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

