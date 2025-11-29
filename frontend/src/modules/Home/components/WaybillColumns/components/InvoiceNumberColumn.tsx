import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';

interface InvoiceNumberColumnProps {
	invoiceNumber: string | null;
	tenantId: number;
}

export const InvoiceNumberColumn = ({
	invoiceNumber,
	tenantId,
}: InvoiceNumberColumnProps) => {
	if (!invoiceNumber) {
		return <div className='text-gray-500 text-xs'>-</div>;
	}

	const invoiceUrl = `https://${tenantId}.fusiontech.asia/dashboard/live/invoices/${invoiceNumber}`;
	// Truncate at 25 characters instead of 15 to show more of the invoice number
	const displayNumber = invoiceNumber.length > 25
		? `${invoiceNumber.substring(0, 25)}...`
		: invoiceNumber;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<a
					href={invoiceUrl}
					target='_blank'
					rel='noopener noreferrer'
					className='text-xs text-blue-800 font-semibold transition-colors hover:underline'
				>
					{displayNumber}
				</a>
			</TooltipTrigger>
			<TooltipContent>
				<div className='max-w-xl break-all'>{invoiceNumber}</div>
			</TooltipContent>
		</Tooltip>
	);
};

