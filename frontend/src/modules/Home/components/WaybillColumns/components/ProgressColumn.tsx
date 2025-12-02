import { FormattedDate } from '@/components/global';
import { 
	FileCheckIcon, 
	FileXIcon, 
	ClockIcon, 
	AlertCircleIcon,
	CheckCircle2Icon,
	Loader2Icon,
	PrinterIcon,
	EyeIcon,
	LinkIcon,
	CopyIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { WAYBILL_ENDPOINTS } from '@/modules/Home/services/endpoints';
import type { WaybillPrint } from '@/modules/Home/services';

interface ProgressColumnProps {
	waybill: Partial<WaybillPrint>;
}

export const ProgressColumn = ({ waybill }: ProgressColumnProps) => {
	const {
		id: waybillId = null,
		status = null,
		local_file_path: localFilePath = null,
		downloaded_at: downloadedAt = null,
		error_message: errorMessage = null,
		print_status: printStatus = null,
		print_error: printError = null,
		print_completed_at: printCompletedAt = null,
		waybill_url: waybillUrl = null,
	} = waybill;
	const previewUrl = waybillId ? WAYBILL_ENDPOINTS.PREVIEW_FILE(waybillId) : null;

	// Copy URL to clipboard
	const copyUrlToClipboard = () => {
		if (waybillUrl) {
			navigator.clipboard.writeText(waybillUrl);
		}
	};

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
		if (printStatus === 'cancelled') return { status: 'cancelled', label: 'Cancelled', icon: AlertCircleIcon };
		if (printStatus === 'error') return { status: 'error', label: 'Failed', icon: AlertCircleIcon };
		if (printError) return { status: 'error', label: 'Failed', icon: AlertCircleIcon };
		if (printStatus === 'completed') return { status: 'completed', label: 'Printed', icon: CheckCircle2Icon };
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
			case 'cancelled':
				return 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200';
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
			<PopoverContent className='w-80 p-3' side='left'>
				<div className='space-y-2'>
					{/* ERRORS - Compact alert */}
					{(errorMessage || printError) && (
						<div className='bg-red-50 border-l-4 border-red-500 p-2 rounded-r text-xs'>
							<div className='flex gap-2'>
								<AlertCircleIcon className='w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5' />
								<div className='space-y-1'>
									{errorMessage && <div className='text-red-800'><span className='font-medium'>Download:</span> {errorMessage}</div>}
									{printError && <div className='text-red-800'><span className='font-medium'>Print:</span> {printError}</div>}
								</div>
							</div>
						</div>
					)}

					{/* WORKFLOW STATUS - Compact inline */}
					<div className='space-y-1'>
						<div className='text-xs font-bold text-gray-500 uppercase px-1'>Status</div>
						
						{/* Download */}
						<div className='flex items-center justify-between text-xs px-2 py-1 bg-gray-50 rounded'>
							<div className='flex items-center gap-1.5'>
								<DownloadIcon className={cn('w-3.5 h-3.5 text-gray-600', downloadStatus.status === 'downloading' && 'animate-spin')} />
								<span className='font-medium'>Download</span>
							</div>
							<Badge variant='outline' className={cn('text-xs px-1.5 py-0', getStatusBadgeClass(downloadStatus.status))}>
								{downloadStatus.label}
							</Badge>
						</div>
						{downloadedAt && (
							<div className='text-xs text-gray-600 px-2'>
								<ClockIcon className='w-3 h-3 inline mr-1' />
								<FormattedDate date={downloadedAt} />
							</div>
						)}

						{/* Print */}
						<div className='flex items-center justify-between text-xs px-2 py-1 bg-gray-50 rounded mt-1'>
							<div className='flex items-center gap-1.5'>
								<PrintIcon className={cn('w-3.5 h-3.5 text-gray-600', printStatusInfo.status === 'printing' && 'animate-spin')} />
								<span className='font-medium'>Print</span>
							</div>
							<Badge variant='outline' className={cn('text-xs px-1.5 py-0', getStatusBadgeClass(printStatusInfo.status))}>
								{printStatusInfo.label}
							</Badge>
						</div>
						{printCompletedAt && (
							<div className='text-xs text-gray-600 px-2'>
								<ClockIcon className='w-3 h-3 inline mr-1' />
								<FormattedDate date={printCompletedAt} />
							</div>
						)}
					</div>

					{/* FILE & PREVIEW - Compact */}
					{localFilePath && previewUrl && (
						<div className='space-y-1 pt-1'>
							<div className='flex items-center gap-1.5 text-xs px-2'>
								<FileCheckIcon className='w-3.5 h-3.5 text-gray-600' />
								<span className='font-medium'>PDF</span>
							</div>
							<Button
								variant='outline'
								size='sm'
								className='w-full h-7 text-xs'
								onClick={() => window.open(previewUrl, '_blank')}
							>
								<EyeIcon className='w-3 h-3 mr-1' />
								Preview
							</Button>
						</div>
					)}

					{/* SOURCE URL - Compact action row */}
					{waybillUrl && (
						<div className='flex items-center gap-1 pt-1'>
							<a
								href={waybillUrl}
								target='_blank'
								rel='noopener noreferrer'
								className='flex-1 text-xs text-blue-600 hover:text-blue-800 underline truncate'
								title={waybillUrl}
							>
								<LinkIcon className='w-3 h-3 inline mr-1 mb-0.5' />
								Open
							</a>
							<Button
								variant='ghost'
								size='sm'
								className='h-6 px-2 hover:bg-gray-100'
								onClick={copyUrlToClipboard}
								title='Copy URL'
							>
								<CopyIcon className='w-3.5 h-3.5' />
							</Button>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
};

