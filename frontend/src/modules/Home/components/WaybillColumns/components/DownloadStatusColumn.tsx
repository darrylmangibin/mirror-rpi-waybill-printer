import { FormattedDate } from '@/components/global';
import { 
	FileCheckIcon,
	ClockIcon, 
	Loader2Icon,
	EyeIcon,
	LinkIcon,
	CopyIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { WAYBILL_ENDPOINTS } from '@/modules/Home/services/endpoints';
import type { WaybillPrint } from '@/modules/Home/services';

interface DownloadStatusColumnProps {
	waybill: Partial<WaybillPrint>;
}

export const DownloadStatusColumn = ({ waybill }: DownloadStatusColumnProps) => {
	const {
		id: waybillId = null,
		status = null,
		local_file_path: localFilePath = null,
		downloaded_at: downloadedAt = null,
		waybill_url: waybillUrl = null,
	} = waybill;

	const getFileFormat = (filePath: string | null): string => {
		if (!filePath) return '';
		const ext = filePath.split('.').pop()?.toUpperCase() || '';
		return ext || 'PDF';
	};

	const fileFormat = getFileFormat(localFilePath);
	const previewUrl = waybillId ? WAYBILL_ENDPOINTS.PREVIEW_FILE(waybillId) : null;

	const copyUrlToClipboard = () => {
		if (waybillUrl) {
			navigator.clipboard.writeText(waybillUrl);
		}
	};

	// Show loading if downloading
	if (status === 'downloading') {
		return (
			<Loader2Icon className='w-4 h-4 text-blue-600 animate-spin' />
		);
	}

	// Show file icon if downloaded
	if (localFilePath && previewUrl) {
		return (
			<Popover>
				<PopoverTrigger asChild>
					<FileCheckIcon className='w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800' />
				</PopoverTrigger>
				<PopoverContent className='w-80 p-3' side='left'>
					<div className='space-y-2'>
						{/* Timestamp */}
						{downloadedAt && (
							<div className='text-xs text-gray-600 px-2'>
								<ClockIcon className='w-3 h-3 inline mr-1' />
								<FormattedDate date={downloadedAt} />
							</div>
						)}

						{/* File Format */}
						<div className='flex items-center gap-1.5 text-xs px-2'>
							<FileCheckIcon className='w-3.5 h-3.5 text-gray-600' />
							<span className='font-medium'>PDF</span>
						</div>

						{/* Preview Button */}
						<Button
							variant='outline'
							size='sm'
							className='w-full h-7 text-xs'
							onClick={() => window.open(previewUrl, '_blank')}
						>
							<EyeIcon className='w-3 h-3 mr-1' />
							Preview
						</Button>

						{/* Source URL */}
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
									Source
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
	}

	// Show nothing if pending or failed (error is shown in Error Message column)
	return <div className='text-gray-300 text-xs'>-</div>;
};

