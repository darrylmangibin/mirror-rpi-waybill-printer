import * as React from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DropdownButtonProps {
	children: React.ReactNode;
}

interface DropdownButtonTriggerProps {
	children: React.ReactNode;
	asChild?: boolean;
}

interface DropdownButtonContentProps extends React.ComponentProps<typeof DropdownMenuContent> {
	children: React.ReactNode;
}

/**
 * Reusable dropdown button component using composition pattern
 * Allows flexible content via children instead of props
 */
export const DropdownButton = ({ children }: DropdownButtonProps) => {
	return <DropdownMenu>{children}</DropdownMenu>;
};

DropdownButton.Trigger = ({ children, asChild = true }: DropdownButtonTriggerProps) => {
	return <DropdownMenuTrigger asChild={asChild}>{children}</DropdownMenuTrigger>;
};

DropdownButton.Content = ({ children, ...props }: DropdownButtonContentProps) => {
	return <DropdownMenuContent {...props}>{children}</DropdownMenuContent>;
};

