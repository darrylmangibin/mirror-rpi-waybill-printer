import { format } from 'date-fns';

interface FormattedDateProps {
	date: string | null;
	dateFormat?: string;
}

export const FormattedDate = ({ date, dateFormat = 'MMM d, yyyy h:mm a' }: FormattedDateProps) => {
	return (
		<div className='text-xs text-gray-700'>
			{date ? format(new Date(date), dateFormat) : '-'}
		</div>
	);
};

