import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateWaybillPrint } from '@/modules/Home/hooks';

// Schema and constants
const formSchema = z.object({
	invoiceNumber: z.string().min(1, 'Invoice number is required').trim(),
	tenantId: z.string().min(1, 'Tenant ID is required').trim(),
	marketplace: z.string().min(1, 'Marketplace is required').trim(),
	url: z.string().optional().refine(
		(val) => !val || val === '' || z.string().url().safeParse(val).success,
		'Please enter a valid URL'
	),
});

type FormValues = z.infer<typeof formSchema>;

interface UseCreateWaybillPrintFormOptions {
	onSuccess?: (invoiceNumber: string, url: string) => Promise<void>;
}

/**
 * Hook to manage create waybill print form logic
 * Handles form state, validation, and submission
 */
export const useCreateWaybillPrintForm = ({ onSuccess }: UseCreateWaybillPrintFormOptions = {}) => {
	const [open, setOpen] = useState(false);
	const { mutateAsync, isPending } = useCreateWaybillPrint();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			invoiceNumber: '',
			tenantId: '',
			marketplace: '',
			url: '',
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
			await mutateAsync({
				invoiceNumber: data.invoiceNumber,
				tenantId: data.tenantId,
				marketplace: data.marketplace,
				waybillUrl: data.url || null,
			});

			if (onSuccess) {
				await onSuccess(data.invoiceNumber, data.url || '');
			}

			setOpen(false);
			form.reset();
		} catch (error) {
			console.error('Failed to create waybill print:', error);
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

