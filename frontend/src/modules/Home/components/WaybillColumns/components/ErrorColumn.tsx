import { AlertCircleIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import type { WaybillPrint } from '@/modules/Home/services';

interface ErrorColumnProps {
	waybill: Partial<WaybillPrint>;
}

export const ErrorColumn = ({ waybill }: ErrorColumnProps) => {
	const {
		error_message: downloadError = null,
		print_error: printError = null,
	} = waybill;

	const hasErrors = downloadError || printError;

	if (!hasErrors) {
		return <div className='text-gray-400 text-xs'>-</div>;
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Badge variant='outline' className='bg-red-50 border-red-200 text-red-700 cursor-pointer hover:bg-red-100'>
					<AlertCircleIcon className='w-3.5 h-3.5 mr-1' />
					<span className='text-xs'>Error</span>
				</Badge>
			</PopoverTrigger>
			<PopoverContent className='w-96 p-4 max-h-96 overflow-y-auto' side='left'>
				<div className='space-y-3'>
					{downloadError && (
						<div className='space-y-2'>
							<div className='flex items-start gap-2'>
								<AlertCircleIcon className='w-4 h-4 text-red-600 flex-shrink-0 mt-0.5' />
								<div className='flex-1 min-w-0'>
									<h5 className='font-semibold text-sm text-red-900'>Download Error</h5>
									<p className='text-sm text-red-800 mt-1 break-words leading-relaxed'>{downloadError}</p>
								</div>
							</div>
						</div>
					)}

					{printError && (
						<div className='space-y-2'>
							{downloadError && <div className='h-px bg-red-200'></div>}
							<div className='flex items-start gap-2'>
								<AlertCircleIcon className='w-4 h-4 text-red-600 flex-shrink-0 mt-0.5' />
								<div className='flex-1 min-w-0'>
									<h5 className='font-semibold text-sm text-red-900'>Print Error</h5>
									<p className='text-sm text-red-800 mt-1 break-words leading-relaxed'>{printError}</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
};
