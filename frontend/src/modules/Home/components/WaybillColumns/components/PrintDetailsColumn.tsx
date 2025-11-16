import { FormattedDate } from '@/components/global';

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

	return (
		<div className='space-y-1'>
			{/* Status Badge */}
			<div className={`inline-block px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
				{statusDisplay}
			</div>

			{/* Details Grid */}
			<div className='text-xs space-y-0.5'>
				{printerName && (
					<div className='text-gray-700'>
						<span className='font-semibold'>Printer:</span> {printerName}
					</div>
				)}

				{cupsJobId && (
					<div className='text-gray-700'>
						<span className='font-semibold'>Job:</span>{' '}
						<span className='font-mono'>{cupsJobId}</span>
					</div>
				)}

				{printCompletedAt && (
					<div className='text-gray-700'>
						<span className='font-semibold'>Completed:</span>{' '}
						<FormattedDate date={printCompletedAt} />
					</div>
				)}

				{printError && (
					<div className='text-red-600 max-w-xs truncate' title={printError}>
						<span className='font-semibold'>Error:</span> {printError}
					</div>
				)}
			</div>
		</div>
	);
};

