import * as React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

type DangerButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
	className?: string;
}

const DangerButton = ({
	className,
	children,
	...props
}: DangerButtonProps) => {
	return (
		<Button
			{...props}
			className={cn(
				'bg-linear-to-br from-red-900 via-red-700 to-red-500 hover:from-red-950 hover:via-red-750 hover:to-red-550 text-white active:scale-95 focus:outline-none focus:ring-0 rounded-lg',
				className
			)}>
			{children}
		</Button>
	);
};

export default DangerButton;

