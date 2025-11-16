import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { marketplaceOptions } from '@/modules/Home/constants';

export interface WaybillPrintFormProps {
	isPending?: boolean;
	isEditing?: boolean;
}

/**
 * Reusable dumb form for creating/editing waybill print jobs
 * Handles all form fields rendering - parent handles form state and submission
 * Must be wrapped in a Form context provider
 */
export const WaybillPrintForm = ({
	isPending = false,
	isEditing = false,
}: WaybillPrintFormProps) => {
	const { control } = useFormContext();

	return (
		<div className='space-y-3'>
			<div className='grid grid-cols-2 gap-3'>
				<FormField
					control={control}
					name='marketplace'
					render={({ field }) => (
						<FormItem>
							<FormLabel className='text-xs font-medium'>Marketplace</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger disabled={isPending} className='h-8 text-sm w-full'>
										<SelectValue placeholder='Select' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{marketplaceOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage className='text-xs' />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name='tenantId'
					render={({ field }) => (
						<FormItem>
							<FormLabel className='text-xs font-medium'>Tenant ID</FormLabel>
							<FormControl>
								<Input
									placeholder='havaianas'
									disabled={isPending}
									className='h-8 text-sm'
									{...field}
								/>
							</FormControl>
							<FormMessage className='text-xs' />
						</FormItem>
					)}
				/>
			</div>

			<FormField
				control={control}
				name='invoiceNumber'
				render={({ field }) => (
					<FormItem>
						<FormLabel className='text-xs font-medium'>Invoice Number</FormLabel>
						<FormControl>
							<Input
								placeholder='INV-2025-00123'
								disabled={isPending}
								className='h-8 text-sm'
								{...field}
							/>
						</FormControl>
						<FormMessage className='text-xs' />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name='url'
				render={({ field }) => (
					<FormItem>
						<FormLabel className='text-xs font-medium'>
							Custom URL{' '}
							<span className='text-gray-400 font-normal'>(Optional)</span>
						</FormLabel>
						<FormControl>
							<Input
								type='url'
								placeholder='https://example.com/waybill.pdf'
								disabled={isPending}
								className='h-8 text-sm'
								{...field}
							/>
						</FormControl>
						<FormMessage className='text-xs' />
					</FormItem>
				)}
			/>
		</div>
	);
};

