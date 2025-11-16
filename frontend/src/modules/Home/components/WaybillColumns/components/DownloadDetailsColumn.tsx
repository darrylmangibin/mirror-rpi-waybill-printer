import { FormattedDate } from '@/components/global';
import { FileCheckIcon, FileXIcon, ClockIcon } from 'lucide-react';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';

interface DownloadDetailsColumnProps {
	localFilePath: string | null;
	downloadedAt: string | null;
}

export const DownloadDetailsColumn = ({
	localFilePath,
	downloadedAt,
}: DownloadDetailsColumnProps) => {
	if (!localFilePath && !downloadedAt) {
		return <div className='text-gray-500 text-xs'>-</div>;
	}

	return (
		<div className='space-y-1'>
			{localFilePath ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className='flex items-center gap-1.5 cursor-pointer'>
							<FileCheckIcon className='w-4 h-4 text-gray-800' />
							<span className='text-xs text-gray-500 font-medium'>File</span>
						</div>
					</TooltipTrigger>
					<TooltipContent className='max-w-xs break-all'>
						{localFilePath}
					</TooltipContent>
				</Tooltip>
			) : downloadedAt ? (
				<div className='flex items-center gap-1.5'>
					<FileXIcon className='w-4 h-4 text-gray-800' />
					<span className='text-xs text-gray-500 font-medium'>File</span>
				</div>
			) : null}

			{downloadedAt && (
				<div className='flex items-center gap-1.5 text-xs text-gray-400'>
					<ClockIcon className='w-3.5 h-3.5 text-gray-600' />
					<FormattedDate date={downloadedAt} />
				</div>
			)}
		</div>
	);
};

