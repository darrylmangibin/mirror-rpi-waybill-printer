import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateWaybillPrint } from '@/modules/Home/hooks';

// Schema and constants
const formSchema = z.object({
	invoiceNumber: z.string().min(1, 'Invoice number is required').trim(),
	url: z.string().min(1, 'URL is required').url('Please enter a valid URL'),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_WAYBILL_URL =
	'https://s3.ap-southeast-1.amazonaws.com/fusion.dig.sg/68f0d71c4179b1760614172.png';

interface UseManualPrintJobFormOptions {
	onSuccess?: (invoiceNumber: string, url: string) => Promise<void>;
}

/**
 * Hook to manage manual print job form logic
 * Handles form state, validation, and submission
 */
export const useManualPrintJobForm = ({ onSuccess }: UseManualPrintJobFormOptions = {}) => {
	const [open, setOpen] = useState(false);
	const { mutateAsync, isPending } = useCreateWaybillPrint();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			invoiceNumber: 'INV-001',
			url: DEFAULT_WAYBILL_URL,
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
				waybillUrl: data.url,
			});

			if (onSuccess) {
				await onSuccess(data.invoiceNumber, data.url);
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

