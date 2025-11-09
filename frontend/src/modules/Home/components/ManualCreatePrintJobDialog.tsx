import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';
import PrimaryButton from '@/components/global/components/buttons/PrimaryButton';
import { DialogHeaderComponent } from '@/components/global/components/DialogHeader';
import { cn } from '@/lib';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateWaybillPrint } from '@/modules/Home/hooks';

interface ManualCreatePrintJobDialogProps {
	onSubmit?: (invoiceNumber: string, url: string) => Promise<void>;
}

const formSchema = z.object({
	invoiceNumber: z.string().min(1, 'Invoice number is required').trim(),
	url: z.string().min(1, 'URL is required').url('Please enter a valid URL'),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_WAYBILL_URL =
	'https://s3.ap-southeast-1.amazonaws.com/fusion.dig.sg/68f0d71c4179b1760614172.png';

export const ManualCreatePrintJobDialog = ({
	onSubmit,
}: ManualCreatePrintJobDialogProps) => {
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
			// Reset form when closing
			form.reset();
		}
	};

	const handleSubmit = async (data: FormValues) => {
		try {
			// Call the backend API to create waybill print
			await mutateAsync({
				invoiceNumber: data.invoiceNumber,
				waybillUrl: data.url,
			});

			// Call onSubmit callback if provided (for backward compatibility)
			if (onSubmit) {
				await onSubmit(data.invoiceNumber, data.url);
			}

			setOpen(false);
			form.reset();
		} catch (error) {
			// Error is handled by the hook, just close on success
			console.error('Failed to create waybill print:', error);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<div className='flex flex-col gap-1'>
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<Button
									size='sm'
									type='button'
									variant='outline'
									className={cn(
										'active:scale-95 focus:outline-none focus:ring-0 rounded-lg gap-2'
									)}>
									<PlusIcon className='w-4 h-4' />
									<span>Manually</span>
								</Button>
							</div>
						</TooltipTrigger>
						<TooltipContent className='bg-gray-900 text-white border-0 max-w-xs'>
							<p className='text-xs'>
								Click to manually create a print job with invoice number and URL
							</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</DialogTrigger>
			<DialogContent
				className='sm:max-w-md p-0 gap-0'
				showCloseButton={false}>
				<DialogHeaderComponent
					icon={
						<PlusIcon
							strokeWidth={2}
							className='w-5 h-5 text-violet-600'
						/>
					}
					title='Create Print Job'
					description='Enter invoice number and URL to create a print job'
				/>

				<div className='px-4 py-4 space-y-4'>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className='space-y-4'>
							<FormField
								control={form.control}
								name='invoiceNumber'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Invoice Number</FormLabel>
										<FormControl>
											<Input
												placeholder='Enter invoice number'
												disabled={isPending}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='url'
								render={({ field }) => (
									<FormItem>
										<FormLabel>URL</FormLabel>
										<FormControl>
											<Input
												type='url'
												placeholder='Enter URL to print'
												disabled={isPending}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</div>

			<DialogFooter>
				<div className='flex items-center justify-end gap-2 w-full bg-gray-100 py-2 rounded-b-lg px-4'>
					<Button
						type='button'
						variant='outline'
						onClick={() => setOpen(false)}
						disabled={isPending}>
						Cancel
					</Button>
					<PrimaryButton
						onClick={form.handleSubmit(handleSubmit)}
						disabled={isPending}>
						{isPending ? 'Creating...' : 'Create'}
					</PrimaryButton>
				</div>
			</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
