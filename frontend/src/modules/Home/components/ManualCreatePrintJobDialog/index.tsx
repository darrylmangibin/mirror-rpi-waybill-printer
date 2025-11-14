import { PlusIcon } from 'lucide-react';
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
import { useManualPrintJobForm } from './useManualPrintJobForm';

interface ManualCreatePrintJobDialogProps {
	onSubmit?: (invoiceNumber: string, url: string) => Promise<void>;
}

export const ManualCreatePrintJobDialog = ({
	onSubmit,
}: ManualCreatePrintJobDialogProps) => {
	const { open, handleOpenChange, form, handleSubmit, isPending } =
		useManualPrintJobForm({ onSuccess: onSubmit });

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
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
								Click to manually create a print job with invoice number, tenant ID, and optional URL
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
					description='Enter invoice number, tenant ID, and optionally a URL to create a print job'
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
								name='tenantId'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tenant ID</FormLabel>
										<FormControl>
											<Input
												placeholder='Enter tenant ID'
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
										<FormLabel>URL <span className='text-gray-500 text-xs font-normal'>(Optional)</span></FormLabel>
										<FormControl>
											<Input
												type='url'
												placeholder='Enter URL to print (leave empty to skip)'
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
							onClick={() => handleOpenChange(false)}
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

