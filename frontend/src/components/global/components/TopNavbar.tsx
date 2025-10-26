export const TopNavbar = () => (
	<div className='border-b border-gray-200 bg-white sticky top-0 z-40'>
		<div className='max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3'>
			{/* Logo and Title */}
			<div className='flex items-center gap-2 sm:gap-3 min-w-0'>
				<div className='text-xl sm:text-xl shrink-0'>📦</div>
				<div className='min-w-0'>
					<h1 className='text-sm sm:text-base font-bold text-gray-900 truncate'>
						RPI Waybill Printer
					</h1>
				</div>
			</div>

			{/* Status Indicator */}
			<div className='flex items-center gap-2 shrink-0'>
				{/* Put Something here... */}
			</div>
		</div>
	</div>
);
