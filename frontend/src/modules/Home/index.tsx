import React from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/global/components/DataTable';
import { TopNavbar } from '@/components/global/components/TopNavbar';
import { SearchBoxInput } from '@/components/global/components/SearchBoxInput';
import {
	getWaybillColumns,
	type WaybillPrint,
} from '@/modules/Home/components/WaybillColumns';
import {
	useGetWaybillPrints,
	usePrintWaybill,
	useWaybillStream,
	useDeleteWaybill,
} from '@/modules/Home/hooks';
import { ScanPrintJobDialog } from '@/modules/Home/components/ScanPrintJobDialog';
import { CreateWaybillPrintDialog } from '@/modules/Home/components/CreateWaybillPrintDialog';
import { EditWaybillPrintDialog } from '@/modules/Home/components/EditWaybillPrintDialog';
import { DownloadWaybillDialog } from '@/modules/Home/components/DownloadWaybillDialog';
import { PrintWaybillDialog } from '@/modules/Home/components/PrintWaybillDialog';
import { DeleteConfirmationDialog } from '@/modules/Home/components/DeleteConfirmationDialog';

const Home = () => {
	const [searchQuery, setSearchQuery] = React.useState('');
	const [editDialogOpen, setEditDialogOpen] = React.useState(false);
	const [downloadDialogOpen, setDownloadDialogOpen] = React.useState(false);
	const [printDialogOpen, setPrintDialogOpen] = React.useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [selectedWaybill, setSelectedWaybill] =
		React.useState<WaybillPrint | null>(null);

	// Initialize Server-Sent Events stream for real-time updates
	useWaybillStream();

	// Smart polling: track active downloads for dynamic intervals
	const [activeDownloads, setActiveDownloads] = React.useState<Set<string>>(
		new Set()
	);
	const [isPolling, setIsPolling] = React.useState(false);

	// Determine polling interval based on active downloads
	// With SSE providing real-time updates, we can use longer intervals for RPi efficiency
	// 2000ms (2s) when downloading, 10000ms (10s) otherwise
	// SSE will trigger immediate cache invalidation on changes
	const pollingInterval = activeDownloads.size > 0 ? 2000 : 10000;

	const { waybills, error, pagination, actions, loading } = useGetWaybillPrints(
		isPolling,
		pollingInterval,
		searchQuery
	);
	const { mutateAsync: printWaybillAsync } = usePrintWaybill();
	const { mutateAsync: deleteWaybillAsync, isPending: isDeleting } =
		useDeleteWaybill();

	// Auto-stop polling when download completes (status becomes "downloaded")
	React.useEffect(() => {
		if (selectedWaybill && activeDownloads.has(String(selectedWaybill.id))) {
			// Find current waybill data
			const currentWaybill = waybills.find((w) => w.id === selectedWaybill.id);

			if (currentWaybill && currentWaybill.status === 'downloaded') {
				// Download completed! Stop polling
				setActiveDownloads((prev) => {
					const next = new Set(prev);
					next.delete(String(selectedWaybill.id));
					return next;
				});
				setIsPolling(false);
			}
		}
	}, [waybills, selectedWaybill, activeDownloads]);

	const handleEditClick = (waybill: WaybillPrint) => {
		setSelectedWaybill(waybill);
		setEditDialogOpen(true);
	};

	const handleDownloadClick = (waybill: WaybillPrint) => {
		setSelectedWaybill(waybill);
		setDownloadDialogOpen(true);
	};

	const handlePrintClick = (waybill: WaybillPrint) => {
		setSelectedWaybill(waybill);
		setPrintDialogOpen(true);
	};

	const handlePrintConfirm = async (waybill: WaybillPrint) => {
		try {
			await printWaybillAsync(waybill.id);
			setPrintDialogOpen(false);
		} catch (error) {
			console.error('Print failed:', error);
		}
	};

	const handleDeleteClick = (waybill: WaybillPrint) => {
		setSelectedWaybill(waybill);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async (waybill: WaybillPrint) => {
		try {
			await deleteWaybillAsync(waybill.id);
			setDeleteDialogOpen(false);
			setSelectedWaybill(null);
		} catch (error) {
			console.error('Delete failed:', error);
		}
	};

	const waybillColumns = React.useMemo(
		() =>
			getWaybillColumns({
				onEditClick: handleEditClick,
				onDownloadClick: handleDownloadClick,
				onPrintClick: handlePrintClick,
				onDeleteClick: handleDeleteClick,
			}),
		[]
	);

	const handleRowsSelected = (rows: typeof waybills) => {
		console.log('Selected rows:', rows);
	};

	if (error) {
		return (
			<>
				<TopNavbar />
				<div className='max-w-7xl mx-auto px-6 py-8'>
					<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
						<h2 className='text-red-900 font-semibold mb-2'>
							Error Loading Waybills
						</h2>
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
			<div className='max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8'>
				<div className='top-toolbar flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-3'>
					<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto'>
						<SearchBoxInput
							value={searchQuery}
							onChange={setSearchQuery}
							onSearch={(query) => {
								setSearchQuery(query);
								// Reset to page 1 when searching
								actions.goToPage(1);
							}}
							autoSelectAllText={true}
						/>
						{/* Live polling indicator */}
						{isPolling && (
							<div className='flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md whitespace-nowrap'>
								<span className='w-2 h-2 bg-blue-600 rounded-full animate-pulse' />
								<span className='text-xs text-blue-600 font-medium'>
									Live{' '}
									{activeDownloads.size > 0 ? `(${activeDownloads.size})` : ''}
								</span>
							</div>
						)}
					</div>
					{/* Create Print Jobs */}
					<div className='flex gap-2 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none'>
						<CreateWaybillPrintDialog
							onSubmit={async () => {
								// Enable polling to watch the auto-download
								setIsPolling(true);
								// The waybill will be in the list after creation
								// SSE will notify of the new waybill immediately
							}}
						/>
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

				{/* DIALOGS / MODALS */}
				{selectedWaybill && (
					<>
			<EditWaybillPrintDialog
				waybill={selectedWaybill}
				open={editDialogOpen}
				onOpenChange={(open) => {
					setEditDialogOpen(open);
					if (!open) {
						setSelectedWaybill(null);
					}
				}}
				onSuccess={async () => {
					setEditDialogOpen(false);
					toast.success('Waybill updated successfully!');
					// Refetch waybill data to reflect changes
					await actions.refetch();
					// Update selectedWaybill with fresh data from refetched waybills
					const updatedWaybill = waybills.find(w => w.id === selectedWaybill?.id);
					if (updatedWaybill) {
						setSelectedWaybill(updatedWaybill);
					}
				}}
			/>
						<DownloadWaybillDialog
							waybillId={String(selectedWaybill.id)}
							invoiceNumber={selectedWaybill.invoice_number}
							waybillUrl={selectedWaybill.waybill_url}
							open={downloadDialogOpen}
							onOpenChange={setDownloadDialogOpen}
							onDownloadStart={() => {
								// Add to active downloads and enable polling
								setActiveDownloads((prev) =>
									new Set(prev).add(String(selectedWaybill.id))
								);
								setIsPolling(true);
							}}
							onDownloadComplete={() => {
								// Remove from active downloads
								setActiveDownloads((prev) => {
									const next = new Set(prev);
									next.delete(String(selectedWaybill.id));
									return next;
								});
								// Disable polling only if no more active downloads
								setIsPolling(false);
							}}
							showTrigger={false}
						/>
						<PrintWaybillDialog
							waybill={selectedWaybill}
							open={printDialogOpen}
							onOpenChange={setPrintDialogOpen}
							onConfirm={handlePrintConfirm}
						/>
						<DeleteConfirmationDialog
							waybill={selectedWaybill}
							open={deleteDialogOpen}
							onOpenChange={setDeleteDialogOpen}
							onConfirm={handleDeleteConfirm}
							isLoading={isDeleting}
						/>
					</>
				)}
			</div>
		</>
	);
};

export default Home;
