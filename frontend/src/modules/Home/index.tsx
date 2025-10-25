import React from 'react';
import { DataTable } from '@/components/global/components/DataTable';
import { TopNavbar } from '@/components/global/components/TopNavbar';
import { SearchBoxInput } from '@/components/global/components/SearchBoxInput';
import { waybillColumns, type WaybillPrint } from '@/modules/Home/components/WaybillColumns';

// Mock data for demonstration
const mockWaybills: WaybillPrint[] = [
	{
		id: 1,
		created_at: '2025-10-25 10:30:00',
		updated_at: '2025-10-25 10:35:00',
		invoice_number: 'INV-2025-001',
		waybill_url: 'https://example.com/waybill/001',
		status: 'downloaded',
		local_file_path: '/storage/waybills/INV-2025-001.pdf',
		error_message: null,
		downloaded_at: '2025-10-25 10:35:00',
	},
	{
		id: 2,
		created_at: '2025-10-25 11:00:00',
		updated_at: '2025-10-25 11:02:00',
		invoice_number: 'INV-2025-002',
		waybill_url: 'https://example.com/waybill/002',
		status: 'downloaded',
		local_file_path: '/storage/waybills/INV-2025-002.pdf',
		error_message: null,
		downloaded_at: '2025-10-25 11:02:00',
	},
	{
		id: 3,
		created_at: '2025-10-25 11:15:00',
		updated_at: '2025-10-25 11:15:00',
		invoice_number: 'INV-2025-003',
		waybill_url: 'https://example.com/waybill/003',
		status: 'pending',
		local_file_path: null,
		error_message: null,
		downloaded_at: null,
	},
	{
		id: 4,
		created_at: '2025-10-25 11:30:00',
		updated_at: '2025-10-25 11:31:00',
		invoice_number: 'INV-2025-004',
		waybill_url: 'https://example.com/waybill/004',
		status: 'failed',
		local_file_path: null,
		error_message: 'Connection timeout while downloading waybill',
		downloaded_at: null,
	},
	{
		id: 5,
		created_at: '2025-10-25 11:45:00',
		updated_at: '2025-10-25 11:50:00',
		invoice_number: 'INV-2025-005',
		waybill_url: 'https://example.com/waybill/005',
		status: 'downloaded',
		local_file_path: '/storage/waybills/INV-2025-005.pdf',
		error_message: null,
		downloaded_at: '2025-10-25 11:50:00',
	},
];

const Home = () => {
	const [searchQuery, setSearchQuery] = React.useState('');

	const handleRowsSelected = (rows: WaybillPrint[]) => {
		console.log('Selected rows:', rows);
	};

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

				<DataTable
					columns={waybillColumns}
					data={mockWaybills}
					pageSize={10}
					onRowsSelected={handleRowsSelected}
				/>
			</div>
		</>
	);
};

export default Home;
