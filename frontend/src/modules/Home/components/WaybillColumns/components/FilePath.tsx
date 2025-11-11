import { FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface FilePathProps {
	path: string | null;
}

export const FilePath = ({ path }: FilePathProps) => {
	if (!path) {
		return <div className='text-gray-500 text-xs'>-</div>;
	}

	// Extract just the filename
	const filename = path.split('/').pop() || path;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className='flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer'>
					<FileText className='h-4 w-4 shrink-0 text-gray-500' />
					<span className='truncate max-w-[150px]'>{filename}</span>
				</div>
			</TooltipTrigger>
			<TooltipContent side="top" className='max-w-xs'>
				{path}
			</TooltipContent>
		</Tooltip>
	);
};

