import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PrimaryButtonProps = React.ComponentProps<'button'> & {
	className?: string;
}

const PrimaryButton = ({
	className,
	children,
	...props
}: PrimaryButtonProps) => {
	return (
		<Button
			size='sm'
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
