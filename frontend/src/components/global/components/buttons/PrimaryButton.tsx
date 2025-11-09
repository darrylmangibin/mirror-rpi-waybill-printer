import * as React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

type PrimaryButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
	className?: string;
}

const PrimaryButton = ({
	className,
	children,
	...props
}: PrimaryButtonProps) => {
	return (
		<Button
			{...props}
			className={cn(
				'bg-linear-to-br from-purple-900 via-purple-700 to-purple-500 hover:from-purple-950 hover:via-purple-750 hover:to-purple-550 text-white active:scale-95 focus:outline-none focus:ring-0 rounded-lg',
				className
			)}>
			{children}
		</Button>
	);
};

export default PrimaryButton;
