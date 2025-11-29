import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';

interface AutoPrintColumnProps {
	autoPrint: boolean | null;
}

export const AutoPrintColumn = ({ autoPrint }: AutoPrintColumnProps) => {
	const isEnabled = autoPrint === true;
	
	// If null/undefined, show as disabled
	const displayValue = isEnabled ? 'Enabled' : 'Disabled';
	const Icon = isEnabled ? CheckCircle2Icon : XCircleIcon;
	
	const badgeClass = isEnabled
		? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200'
		: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200';

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className='flex items-center gap-1.5 cursor-pointer'>
					<Badge variant='outline' className={cn('rounded-full', badgeClass)}>
						<span className='flex items-center gap-1'>
							<Icon className='w-3.5 h-3.5' />
							<span className='text-xs'>{displayValue}</span>
						</span>
					</Badge>
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<div className='space-y-1'>
					<div className='font-semibold'>Auto Print</div>
					<div className='text-sm'>
						{isEnabled
							? 'Automatically prints after download completes'
							: 'Manual print required after download'}
					</div>
				</div>
			</TooltipContent>
		</Tooltip>
	);
};

