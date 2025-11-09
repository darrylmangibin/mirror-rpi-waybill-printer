import React from 'react';
import { DataTable } from '@/components/global/components/DataTable';
import { TopNavbar } from '@/components/global/components/TopNavbar';
import { SearchBoxInput } from '@/components/global/components/SearchBoxInput';
import { waybillColumns } from '@/modules/Home/components/WaybillColumns';
import { useGetWaybillPrints } from '@/modules/Home/hooks';
import { ScanPrintJobDialog } from '@/modules/Home/components/ScanPrintJobDialog';
import { ManualCreatePrintJobDialog } from '@/modules/Home/components/ManualCreatePrintJobDialog';

const Home = () => {
	const [searchQuery, setSearchQuery] = React.useState('');
	const { waybills, error, pagination, actions, loading } = useGetWaybillPrints();

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
					<div className='flex gap-2'>
						<ManualCreatePrintJobDialog />
						<ScanPrintJobDialog />
					</div>
				</div>

				<DataTable
					columns={waybillColumns}
					data={waybills}
					pageSize={pagination.perPage}
					onRowsSelected={handleRowsSelected}
					currentPage={pagination.page}
					totalPages={pagination.totalPages}
					onPageChange={actions.goToPage}
					isLoading={loading}
				/>
			</div>
		</>
	);
};

export default Home;
