import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoPrintColumnProps {
	autoPrint: boolean | null;
}

export const AutoPrintColumn = ({ autoPrint }: AutoPrintColumnProps) => {
	const isEnabled = autoPrint === true;
	const Icon = isEnabled ? CheckCircle2Icon : XCircleIcon;
	const color = isEnabled ? 'text-green-600' : 'text-gray-400';

	return (
		<div className='flex justify-center'>
			<Icon className={cn('w-5 h-5', color)} />
		</div>
	);
};

