import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

interface ErrorColumnProps {
	errorMessage: string | null;
}

export const ErrorColumn: React.FC<ErrorColumnProps> = ({ errorMessage }) => {
	// Only show warning icon if there's an error message
	if (errorMessage) {
		return (
			<Popover>
				<PopoverTrigger asChild>
						<AlertTriangle className="w-5 h-5 text-yellow-500 hover:text-yellow-600 cursor-pointer" />
				</PopoverTrigger>
				<PopoverContent className="w-72" side="left">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
							<h4 className="font-semibold text-yellow-900">Warning Details</h4>
						</div>
						<p className="text-sm text-gray-700 wrap-break-word">
							{errorMessage}
						</p>
					</div>
				</PopoverContent>
			</Popover>
		);
	}

	// Return null for everything else
	return null;
};

