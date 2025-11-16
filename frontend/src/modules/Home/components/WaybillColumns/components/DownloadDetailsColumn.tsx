import { FormattedDate } from '@/components/global';
import { FileIcon, Clock, X } from 'lucide-react';
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
							<FileIcon className='w-4 h-4 text-green-600 flex-shrink-0' />
						</div>
					</TooltipTrigger>
					<TooltipContent className='max-w-xs break-all'>
						{localFilePath}
					</TooltipContent>
				</Tooltip>
			) : downloadedAt ? (
				<div className='flex items-center gap-1.5'>
					<X className='w-4 h-4 text-red-600 flex-shrink-0' />
				</div>
			) : null}

			{downloadedAt && (
				<div className='flex items-center gap-1.5 text-xs text-gray-600'>
					<Clock className='w-3.5 h-3.5 text-gray-600 flex-shrink-0' />
					<FormattedDate date={downloadedAt} />
				</div>
			)}
		</div>
	);
};

