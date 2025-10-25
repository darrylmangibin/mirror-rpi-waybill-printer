import React from 'react';
import { SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBoxInputProps {
	value?: string;
	placeholder?: string;
	onChange?: (value: string) => void;
	onSearch?: (value: string) => void;
}

export const SearchBoxInput: React.FC<SearchBoxInputProps> = ({
	value = '',
	placeholder = 'Search here...',
	onChange,
	onSearch,
}) => {
	const handleSearch = () => {
		if (onSearch) {
			onSearch(value);
		}
	};

	return (
		<div className='search-box relative'>
			<Input
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange?.(e.target.value)}
				onKeyPress={(e) => {
					if (e.key === 'Enter') {
						handleSearch();
					}
				}}
				className='w-[300px] h-8 bg-white focus-visible:ring-violet-200 focus-visible:ring-[2px]'
			/>
			<Button
				size={'icon'}
				variant='ghost'
				type='button'
				className='absolute right-0 top-0 h-8 w-8 p-0 cursor-pointer hover:bg-transparent'
				onClick={handleSearch}>
				<SearchIcon className='h-4 w-4 text-gray-500' />
			</Button>
		</div>
	);
};
