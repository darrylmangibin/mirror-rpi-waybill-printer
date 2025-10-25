export interface TopNavbarProps {
	loading: boolean;
	error: boolean;
	data: any;
}

export const TopNavbar = ({ loading, error, data }: TopNavbarProps) => (
	<div className='border-b border-gray-200 bg-white sticky top-0 z-40'>
		<div className='max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3'>
			{/* Logo and Title */}
			<div className='flex items-center gap-2 sm:gap-3 min-w-0'>
				<div className='text-lg sm:text-xl flex-shrink-0'>📦</div>
				<div className='min-w-0'>
					<h1 className='text-sm sm:text-base font-bold text-gray-900 truncate'>
						RPI Waybill Printer
					</h1>
					<p className='text-xs text-gray-600 hidden sm:block'>
						Shipping Label Management System
					</p>
				</div>
			</div>

			{/* Status Indicator */}
			<div className='flex items-center gap-2 flex-shrink-0'>
				{loading && (
					<span className='text-xs text-blue-600 whitespace-nowrap'>
						🔄 <span className='hidden sm:inline'>Connecting...</span>
					</span>
				)}
				{error && (
					<span className='text-xs text-red-600 whitespace-nowrap'>
						❌ <span className='hidden sm:inline'>Error</span>
					</span>
				)}
				{data && (
					<span className='text-xs text-green-600 whitespace-nowrap'>
						✅ <span className='hidden sm:inline'>Connected</span>
					</span>
				)}
			</div>
		</div>
	</div>
);
