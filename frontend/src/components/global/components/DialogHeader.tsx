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
	variant?: 'default' | 'danger';
}

const variantStyles = {
	default: {
		outerBg: 'bg-violet-100/30',
		middleBg: 'bg-violet-300/30',
		innerBg: 'bg-violet-500/30',
		titleColor: 'text-zinc-700',
		descriptionColor: 'text-zinc-500',
	},
	danger: {
		outerBg: 'bg-red-100/30',
		middleBg: 'bg-red-300/30',
		innerBg: 'bg-red-500/30',
		titleColor: 'text-red-700',
		descriptionColor: 'text-red-600',
	},
};

export const DialogHeaderComponent = ({
	icon,
	title,
	description,
	className = 'p-4',
	variant = 'default',
}: DialogHeaderProps) => {
	const styles = variantStyles[variant];

	return (
		<DialogHeader className={cn(className)}>
			<div className='flex items-center justify-start gap-4'>
				{icon && (
					<div className='shrink-0 relative w-[88px] h-[88px]'>
						{/* Outer layer - lightest */}
						<div className={cn('absolute inset-0 w-[88px] h-[88px] rounded-full flex items-center justify-center', styles.outerBg)} />
						{/* Middle layer - medium */}
						<div className='absolute inset-0 flex items-center justify-center'>
							<div className={cn('w-[72px] h-[72px] rounded-full flex items-center justify-center', styles.middleBg)}>
								{/* Inner layer - darkest */}
								<div className={cn('w-[56px] h-[56px] rounded-full flex items-center justify-center', styles.innerBg)}>
									{icon}
								</div>
							</div>
						</div>
					</div>
				)}
				<div className='flex-1 min-w-0'>
					<DialogTitle className={cn('text-lg sm:text-xl font-bold mb-0.5', styles.titleColor)}>
						{title}
					</DialogTitle>
					{description && (
						<DialogDescription className={cn('text-sm', styles.descriptionColor)}>
							{description}
						</DialogDescription>
					)}
				</div>
			</div>
		</DialogHeader>
	);
};
