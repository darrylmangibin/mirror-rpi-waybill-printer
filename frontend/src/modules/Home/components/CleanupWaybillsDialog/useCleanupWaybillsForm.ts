import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCleanupWaybills } from '@/modules/Home/hooks';
import { toast } from 'sonner';

// Schema and constants
const formSchema = z
	.object({
		from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'From date must be in YYYY-MM-DD format'),
		to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'To date must be in YYYY-MM-DD format'),
	})
	.refine((data) => {
		const fromDate = new Date(data.from);
		const toDate = new Date(data.to);
		return fromDate <= toDate;
	}, {
		message: 'From date must be before or equal to to date',
		path: ['to'],
	});

type FormValues = z.infer<typeof formSchema>;

interface UseCleanupWaybillsFormOptions {
	onSuccess?: () => Promise<void>;
}

/**
 * Hook to manage cleanup waybills form logic
 * Handles form state, validation, and submission
 */
export const useCleanupWaybillsForm = ({
	onSuccess,
}: UseCleanupWaybillsFormOptions = {}) => {
	const [open, setOpen] = useState(false);
	const { mutateAsync, isPending } = useCleanupWaybills();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			from: '',
			to: '',
		},
	});

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			form.reset();
		}
	};

	const handleSubmit = async (data: FormValues) => {
		try {
			const result = await mutateAsync({
				from: data.from,
				to: data.to,
			});

			if (result.status === 'success') {
				toast.success(result.message || 'Waybills cleaned up successfully');
			} else {
				toast.error(result.message || 'Failed to cleanup waybills');
			}

			if (onSuccess) {
				await onSuccess();
			} else {
				setOpen(false);
			}
			form.reset();
		} catch (error) {
			console.error('Failed to cleanup waybills:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to cleanup waybills'
			);
		}
	};

	return {
		open,
		form,
		handleOpenChange,
		handleSubmit,
		isPending,
	};
};

export type { FormValues };

