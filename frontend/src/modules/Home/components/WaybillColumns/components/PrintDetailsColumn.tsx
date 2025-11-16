import { FormattedDate } from '@/components/global';
import { ClockIcon, AlertCircleIcon } from 'lucide-react';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';

interface PrintDetailsColumnProps {
	printStatus: string | null;
	printerName: string | null;
	cupsJobId: number | null;
	printError: string | null;
	printCompletedAt: string | null;
}

export const PrintDetailsColumn = ({
	printStatus,
	printerName,
	cupsJobId,
	printError,
	printCompletedAt,
}: PrintDetailsColumnProps) => {
	const statusColors: Record<string, string> = {
		idle: 'bg-gray-100 text-gray-800',
		pending: 'bg-yellow-100 text-yellow-800',
		printing: 'bg-blue-100 text-blue-800',
		completed: 'bg-green-100 text-green-800',
		error: 'bg-red-100 text-red-800',
	};

	const colorClass = statusColors[printStatus || 'idle'] || statusColors.idle;
	const statusDisplay = printStatus
		? printStatus.charAt(0).toUpperCase() + printStatus.slice(1)
		: 'Idle';

	if (!cupsJobId && !printCompletedAt && !printError) {
		return (
			<div className='space-y-1'>
				<div className={`inline-block px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
					{statusDisplay}
				</div>
				<div className='text-gray-500 text-xs'>-</div>
			</div>
		);
	}

	return (
		<div className='space-y-1'>
			{/* Status Badge with Error Icon */}
			<div className='flex items-center justify-between'>
				<div className={`inline-block px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
					{statusDisplay}
				</div>
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

			{/* Details - Compact Layout */}
			<div className='space-y-1'>
				{cupsJobId && (
					<Tooltip>
						<TooltipTrigger asChild>
							<div className='flex items-center gap-1.5 cursor-pointer'>
								<span className='text-xs text-gray-500 font-medium font-mono'>#{cupsJobId}</span>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							Job ID: {cupsJobId}
						</TooltipContent>
					</Tooltip>
				)}

				{printCompletedAt && (
					<div className='flex items-center gap-1.5 text-xs text-gray-400'>
						<ClockIcon className='w-3.5 h-3.5 text-gray-600' />
						<FormattedDate date={printCompletedAt} />
					</div>
				)}
			</div>
		</div>
	);
};

