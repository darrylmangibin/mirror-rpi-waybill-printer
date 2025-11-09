import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib';

interface WaybillPrintStatusBadgeProps {
	status: string;
}

function getStatusBadgeClass(status: string): string {
	switch (status) {
		case 'error':
			return 'bg-red-500/20 text-red-700 border border-red-300';
		default:
			return 'text-gray-700 border-0';
	}
}

export const WaybillPrintStatusBadge = ({ status }: WaybillPrintStatusBadgeProps) => {
	return (
		<Badge
			variant='outline'
			className={cn(getStatusBadgeClass(status), 'rounded-md px-3 py-0.5')}>
			<p className="capitalize">{status}</p>
		</Badge>
	);
};

