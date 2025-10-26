import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';

interface DialogHeaderProps {
	icon?: ReactNode;
	title: string;
	description?: string;
	className?: string;
}

export const DialogHeaderComponent = ({
	icon,
	title,
	description,
	className = 'p-4',
}: DialogHeaderProps) => {
	return (
		<DialogHeader className={cn(className)}>
			<div className='flex items-center justify-start gap-4'>
				{icon && (
					<div className='shrink-0 relative w-[88px] h-[88px]'>
						{/* Outer layer - lightest */}
						<div className='absolute inset-0 w-[88px] h-[88px] bg-violet-100/30 rounded-full flex items-center justify-center' />
						{/* Middle layer - medium */}
						<div className='absolute inset-0 flex items-center justify-center'>
							<div className='w-[72px] h-[72px] bg-violet-300/30 rounded-full flex items-center justify-center'>
								{/* Inner layer - darkest */}
								<div className='w-[56px] h-[56px] bg-violet-500/30 rounded-full flex items-center justify-center'>
									{icon}
								</div>
							</div>
						</div>
					</div>
				)}
				<div className='flex-1 min-w-0'>
					<DialogTitle className='text-lg sm:text-xl font-bold text-zinc-700 mb-0.5'>
						{title}
					</DialogTitle>
					{description && (
						<DialogDescription className='text-sm text-zinc-500'>
							{description}
						</DialogDescription>
					)}
				</div>
			</div>
		</DialogHeader>
	);
};
