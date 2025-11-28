import { Badge } from '@/components/ui/badge';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';
import { Store as ShopIcon } from 'lucide-react';

interface PlatformBadgeProps {
	tenantId: number | string | null;
	icon?: string;
	marketplace?: string;
	isNoMarketplace?: boolean;
}

export const PlatformBadge = ({ tenantId, icon, marketplace, isNoMarketplace }: PlatformBadgeProps) => {
	if (!tenantId) {
		return <div className='text-gray-500 text-xs'>-</div>;
	}

	const formattedTenantId = String(tenantId).charAt(0).toUpperCase() + String(tenantId).slice(1);

	return (
		<Badge
			className='bg-blue-50 text-blue-800 border-blue-200 gap-1.5 px-2 py-1 text-[11px] leading-[10px] rounded-[16px]'
			variant='outline'>
			<span className='font-semibold whitespace-nowrap'>
				{formattedTenantId}
			</span>
			{(icon || isNoMarketplace) && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className='flex items-center justify-center h-4 w-4 rounded-full border border-blue-300 bg-white shadow-sm shrink-0 cursor-pointer relative overflow-hidden'>
							{isNoMarketplace ? (
								<ShopIcon className='w-3 h-3 text-blue-600' />
							) : (
								<img
									src={icon}
									alt='marketplace icon'
									className='absolute inset-0 w-full h-full p-0.5 object-contain object-center'
								/>
							)}
						</div>
					</TooltipTrigger>
					<TooltipContent>
						{marketplace || 'Marketplace'}
					</TooltipContent>
				</Tooltip>
			)}
		</Badge>
	);
};

