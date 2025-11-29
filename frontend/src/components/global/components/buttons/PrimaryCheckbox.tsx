import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type PrimaryCheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

const PrimaryCheckbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	PrimaryCheckboxProps
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		data-slot="checkbox"
		className={cn(
			'peer border-input data-[state=checked]:bg-purple-700 data-[state=checked]:text-white dark:data-[state=checked]:bg-purple-700 data-[state=checked]:border-purple-700 focus-visible:border-purple-600 focus-visible:ring-purple-600/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			data-slot="checkbox-indicator"
			className="grid place-content-center text-current transition-none"
		>
			<CheckIcon className="size-3.5" />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
PrimaryCheckbox.displayName = 'PrimaryCheckbox';

export default PrimaryCheckbox;

