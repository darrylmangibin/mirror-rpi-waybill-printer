import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import waybillService, {
	type WaybillPrint,
} from '@/modules/Home/services/waybillService';

// Reuse the same schema as the create form
const formSchema = z.object({
	invoiceNumber: z.string().min(1, 'Invoice number is required').trim(),
	tenantId: z.string().min(1, 'Tenant ID is required').trim(),
	marketplace: z.string().min(1, 'Marketplace is required').trim(),
	url: z
		.string()
		.optional()
		.refine(
			(val) =>
				!val || val === '' || z.string().url().safeParse(val).success,
			'Please enter a valid URL'
		),
});

type FormValues = z.infer<typeof formSchema>;

interface UseEditWaybillPrintFormOptions {
	waybill: WaybillPrint;
	onSuccess?: (invoiceNumber: string, url: string) => Promise<void>;
}

/**
 * Hook to manage edit waybill print form logic
 * Handles form state, validation, and submission
 */
export const useEditWaybillPrintForm = ({
	waybill,
	onSuccess,
}: UseEditWaybillPrintFormOptions) => {
	const [open, setOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			invoiceNumber: waybill.invoice_number || '',
			tenantId: waybill.tenant_id?.toString() || '',
			marketplace: waybill.marketplace || '',
			url: waybill.waybill_url || '',
		},
	});

	// Reset form whenever waybill ID changes (e.g., when reopening with different waybill)
	// Only depend on specific waybill properties to avoid unnecessary re-runs and memory leaks
	useEffect(() => {
		form.reset({
			invoiceNumber: waybill.invoice_number || '',
			tenantId: waybill.tenant_id?.toString() || '',
			marketplace: waybill.marketplace || '',
			url: waybill.waybill_url || '',
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [waybill.id, waybill.invoice_number, waybill.tenant_id, waybill.marketplace, waybill.waybill_url]);

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			form.reset({
				invoiceNumber: waybill.invoice_number || '',
				tenantId: waybill.tenant_id?.toString() || '',
				marketplace: waybill.marketplace || '',
				url: waybill.waybill_url || '',
			});
		}
	};

	const handleSubmit = async (data: FormValues) => {
		setIsPending(true);
		try {
			await waybillService.updateWaybillPrint(
				waybill.id,
				data.invoiceNumber,
				data.tenantId,
				data.url || null,
				data.marketplace
			);

			if (onSuccess) {
				await onSuccess(data.invoiceNumber, data.url || '');
			}

			setOpen(false);
			form.reset();
		} catch (error) {
			console.error('Failed to update waybill print:', error);
		} finally {
			setIsPending(false);
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

