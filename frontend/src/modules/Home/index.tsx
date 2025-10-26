import React from 'react';
import { DataTable } from '@/components/global/components/DataTable';
import { TopNavbar } from '@/components/global/components/TopNavbar';
import { SearchBoxInput } from '@/components/global/components/SearchBoxInput';
import { waybillColumns } from '@/modules/Home/components/WaybillColumns';
import { useGetWaybillPrints } from '@/modules/Home/hooks';

const Home = () => {
	const [searchQuery, setSearchQuery] = React.useState('');
	const { waybills, loading, error, pagination, actions } = useGetWaybillPrints(1, 10);

	const handleRowsSelected = (rows: typeof waybills) => {
		console.log('Selected rows:', rows);
	};

	if (error) {
		return (
			<>
				<TopNavbar />
				<div className='max-w-7xl mx-auto px-6 py-8'>
					<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
						<h2 className='text-red-900 font-semibold mb-2'>Error Loading Waybills</h2>
						<p className='text-red-700'>{error}</p>
						<button
							onClick={() => actions.refetch()}
							className='mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'>
							Retry
						</button>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			{/* Top Navigation Bar */}
			<TopNavbar />

			{/* Main Content */}
			<div className='max-w-7xl mx-auto px-6 py-8'>
				<div className='top-toolbar flex items-center justify-between mb-3'>
					<div>
						<SearchBoxInput
							value={searchQuery}
							onChange={setSearchQuery}
							onSearch={(query) => {
								alert(`Searching for: ${query}`);
							}}
							autoSelectAllText={true}
						/>
					</div>
					{/* Commented for now */}
					{/* <PrimaryButton onClick={() => {
						console.log('Adding waybill...');
					}}>
						<div className='flex items-center gap-2'>
							<PlusIcon className='h-4 w-4' />
							<span>
								Add Print
							</span>
						</div>
					</PrimaryButton> */}
				</div>

				{loading ? (
					<div className='flex items-center justify-center py-12'>
						<div className='text-center'>
							<div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4'></div>
							<p className='text-gray-600'>Loading waybills...</p>
						</div>
					</div>
				) : (
					<>
						<div className='mb-4 text-sm text-gray-600'>
							{pagination.total > 0 && (
								<span>
									Showing {(pagination.page - 1) * pagination.perPage + 1} to{' '}
									{Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
									{pagination.total} waybills
								</span>
							)}
						</div>
						<DataTable
							columns={waybillColumns as any}
							data={waybills}
							pageSize={pagination.perPage}
							onRowsSelected={handleRowsSelected}
						/>
						{pagination.totalPages > 1 && (
							<div className='flex justify-between items-center mt-6'>
								<button
									onClick={() => actions.goToPage(pagination.page - 1)}
									disabled={pagination.page === 1}
									className='px-4 py-2 bg-gray-200 text-gray-900 rounded disabled:opacity-50 hover:bg-gray-300'>
									Previous
								</button>
								<span className='text-gray-600'>
									Page {pagination.page} of {pagination.totalPages}
								</span>
								<button
									onClick={() => actions.goToPage(pagination.page + 1)}
									disabled={pagination.page === pagination.totalPages}
									className='px-4 py-2 bg-gray-200 text-gray-900 rounded disabled:opacity-50 hover:bg-gray-300'>
									Next
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</>
	);
};

export default Home;
