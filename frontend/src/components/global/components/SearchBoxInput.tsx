import React from 'react';
import { SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBoxInputProps {
	value?: string;
	placeholder?: string;
	onChange?: (value: string) => void;
	onSearch?: (value: string) => void;
	searchPosition?: 'left' | 'right';
	autoSelectAllText?: boolean;
}

export const SearchBoxInput: React.FC<SearchBoxInputProps> = ({
	value = '',
	placeholder = 'Search here...',
	onChange,
	onSearch,
	searchPosition = 'left',
	autoSelectAllText = false,
}) => {
	const handleSearch = () => {
		if (onSearch) {
			onSearch(value);
		}
	};

	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		if (autoSelectAllText) {
			e.target.select();
		}
	};

	return (
		<div className={cn('search-box relative w-full sm:w-auto', searchPosition === 'right' ? 'flex-row-reverse' : 'flex-row')}>
			{searchPosition === 'left' && (
				<Button
					size={'icon'}
					variant='ghost'
					type='button'
					className='absolute left-0 top-0 h-8 w-8 p-0 cursor-pointer hover:bg-transparent'
					onClick={handleSearch}>
					<SearchIcon className='h-4 w-4 text-gray-500' />
				</Button>
			)}
		<Input
			placeholder={placeholder}
			value={value}
			onChange={(e) => onChange?.(e.target.value)}
			onKeyDown={(e) => {
				if (e.key === 'Enter') {
					handleSearch();
				}
			}}
			onFocus={handleFocus}
			className={cn(
				'w-full sm:w-[300px] h-8 bg-white focus-visible:ring-purple-200 focus-visible:ring-[2px] selection:bg-blue-500',
				searchPosition === 'left' ? 'pl-8' : 'pr-8'
			)}
		/>
			{searchPosition === 'right' && (
				<Button
					size={'icon'}
					variant='ghost'
					type='button'
					className='absolute right-0 top-0 h-8 w-8 p-0 cursor-pointer hover:bg-transparent'
					onClick={handleSearch}>
					<SearchIcon className='h-4 w-4 text-gray-500' />
				</Button>
			)}
		</div>
	);
};
