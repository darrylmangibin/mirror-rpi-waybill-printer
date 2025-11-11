import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WaybillUrlBadgeProps {
	url: string | null;
}

export const WaybillUrlBadge = ({ url }: WaybillUrlBadgeProps) => {
	if (!url) {
		return <div className='text-gray-500'>-</div>;
	}

	return (
		<Badge
			variant='outline'
			className='cursor-pointer hover:bg-gray-100 transition-all flex items-center gap-1.5 px-2.5 py-1'
			onClick={() => window.open(url, '_blank')}
			title={url}>
			<span className='text-[10px] font-medium'>Open URL</span>
			<ExternalLink className='h-3.5 w-3.5 shrink-0' />
		</Badge>
	);
};

