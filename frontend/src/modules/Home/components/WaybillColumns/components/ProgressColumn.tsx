import { FormattedDate } from '@/components/global';
import { 
	FileCheckIcon, 
	FileXIcon, 
	ClockIcon, 
	AlertCircleIcon,
	CheckCircle2Icon,
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

interface ProgressColumnProps {
	waybill: Partial<WaybillPrint>;
}

export const ProgressColumn = ({ waybill }: ProgressColumnProps) => {
	const {
		status = null,
		local_file_path: localFilePath = null,
		downloaded_at: downloadedAt = null,
		error_message: errorMessage = null,
		print_status: printStatus = null,
		cups_job_id: cupsJobId = null,
		print_error: printError = null,
		print_completed_at: printCompletedAt = null,
		waybill_url: waybillUrl = null,
	} = waybill;

	// Download status
	const getDownloadStatus = () => {
		if (errorMessage) return { status: 'error', label: 'Failed', icon: FileXIcon };
		if (downloadedAt && localFilePath) return { status: 'completed', label: 'Downloaded', icon: FileCheckIcon };
		if (status === 'downloading') return { status: 'downloading', label: 'Downloading', icon: Loader2Icon };
		if (status === 'downloaded') return { status: 'completed', label: 'Downloaded', icon: FileCheckIcon };
		return { status: 'pending', label: 'Pending', icon: ClockIcon };
	};

	// Print status
	const getPrintStatus = () => {
		if (printError) return { status: 'error', label: 'Failed', icon: AlertCircleIcon };
		if (printCompletedAt) return { status: 'completed', label: 'Printed', icon: CheckCircle2Icon };
		if (printStatus === 'printing') return { status: 'printing', label: 'Printing', icon: Loader2Icon };
		if (printStatus === 'pending') return { status: 'pending', label: 'Queued', icon: ClockIcon };
		return { status: 'idle', label: 'Idle', icon: PrinterIcon };
	};

	const downloadStatus = getDownloadStatus();
	const printStatusInfo = getPrintStatus();

	const getStatusBadgeClass = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200';
			case 'error':
				return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200';
			case 'downloading':
			case 'printing':
				return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200';
			default:
				return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200';
		}
	};

	const DownloadIcon = downloadStatus.icon;
	const PrintIcon = printStatusInfo.icon;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className='flex flex-col gap-1.5 cursor-pointer'>
					{/* Download Status */}
					<Badge 
						variant='outline' 
						className={cn('rounded-full w-fit', getStatusBadgeClass(downloadStatus.status))}
					>
						<span className='flex items-center gap-1'>
							<DownloadIcon className={cn(
								'w-3.5 h-3.5',
								downloadStatus.status === 'downloading' && 'animate-spin'
							)} />
							<span className='text-xs'>{downloadStatus.label}</span>
						</span>
					</Badge>

					{/* Print Status */}
					<Badge 
						variant='outline' 
						className={cn('rounded-full w-fit', getStatusBadgeClass(printStatusInfo.status))}
					>
						<span className='flex items-center gap-1'>
							<PrintIcon className={cn(
								'w-3.5 h-3.5',
								printStatusInfo.status === 'printing' && 'animate-spin'
							)} />
							<span className='text-xs'>{printStatusInfo.label}</span>
						</span>
					</Badge>
				</div>
			</PopoverTrigger>
			<PopoverContent className='w-80' side='left'>
				<div className='space-y-4'>
					{/* Download Details */}
					<div className='space-y-2'>
						<h4 className='font-semibold text-sm flex items-center gap-2'>
							<FileCheckIcon className='w-4 h-4' />
							Download Details
						</h4>
						<div className='space-y-1 text-sm'>
							{downloadedAt && (
								<div className='flex items-center gap-2'>
									<ClockIcon className='w-3.5 h-3.5 text-gray-500' />
									<span className='text-gray-600'>Downloaded:</span>
									<FormattedDate date={downloadedAt} />
								</div>
							)}
							{localFilePath && (
								<div className='flex items-start gap-2'>
									<FileCheckIcon className='w-3.5 h-3.5 text-gray-500 mt-0.5' />
									<div className='flex-1'>
										<span className='text-gray-600'>File:</span>
										<div className='text-xs break-all text-gray-700 mt-0.5'>{localFilePath}</div>
									</div>
								</div>
							)}
							{errorMessage && (
								<div className='flex items-start gap-2'>
									<AlertCircleIcon className='w-3.5 h-3.5 text-red-500 mt-0.5' />
									<div className='flex-1'>
										<span className='text-red-600 font-medium'>Error:</span>
										<div className='text-xs break-all text-red-700 mt-0.5'>{errorMessage}</div>
									</div>
								</div>
							)}
							{!downloadedAt && !localFilePath && !errorMessage && (
								<div className='text-gray-500 text-xs'>No download information available</div>
							)}
						</div>
					</div>

					{/* Print Details */}
					<div className='space-y-2'>
						<h4 className='font-semibold text-sm flex items-center gap-2'>
							<PrinterIcon className='w-4 h-4' />
							Print Details
						</h4>
						<div className='space-y-1 text-sm'>
							{printCompletedAt && (
								<div className='flex items-center gap-2'>
									<ClockIcon className='w-3.5 h-3.5 text-gray-500' />
									<span className='text-gray-600'>Completed:</span>
									<FormattedDate date={printCompletedAt} />
								</div>
							)}
							{cupsJobId && (
								<div className='flex items-center gap-2'>
									<span className='text-gray-600'>Job ID:</span>
									<span className='text-gray-700 font-mono text-xs'>{cupsJobId}</span>
								</div>
							)}
							{printError && (
								<div className='flex items-start gap-2'>
									<AlertCircleIcon className='w-3.5 h-3.5 text-red-500 mt-0.5' />
									<div className='flex-1'>
										<span className='text-red-600 font-medium'>Error:</span>
										<div className='text-xs break-all text-red-700 mt-0.5'>{printError}</div>
									</div>
								</div>
							)}
							{!printCompletedAt && !cupsJobId && !printError && (
								<div className='text-gray-500 text-xs'>No print information available</div>
							)}
						</div>
					</div>

					{/* Waybill URL */}
					{waybillUrl && (
						<div className='space-y-2'>
							<h4 className='font-semibold text-sm'>Waybill URL</h4>
							<a
								href={waybillUrl}
								target='_blank'
								rel='noopener noreferrer'
								className='text-xs text-blue-600 hover:text-blue-800 break-all underline'
							>
								{waybillUrl}
							</a>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
};

