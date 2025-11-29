import { ExternalLinkIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';
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
	} = waybill;

	const previewUrl = waybillId ? WAYBILL_ENDPOINTS.PREVIEW_FILE(waybillId) : null;

	// Show loading if downloading
	if (status === 'downloading') {
		return (
			<Loader2Icon className='w-4 h-4 text-blue-600 animate-spin' />
		);
	}

	// Show file icon if downloaded - click to preview
	if (localFilePath && previewUrl) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant='outline'
						size='sm'
						onClick={() => window.open(previewUrl, '_blank')}
						className='text-xs text-gray-600 hover:text-gray-700 py-0.5 h-6 rounded-full'
					>
						Preview
						<ExternalLinkIcon strokeWidth={2} className='size-3 ml-1' />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					Click to preview file in new tab
				</TooltipContent>
			</Tooltip>
		);
	}

	// Show nothing if pending or failed (error is shown in Error Message column)
	return <div className='text-gray-300 text-xs'>-</div>;
};

