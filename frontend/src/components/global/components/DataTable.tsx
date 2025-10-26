'use client';

import * as React from 'react';
import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	Table as ReactTable,
	VisibilityState,
} from '@tanstack/react-table';
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Pagination } from './paginations/Pagination';

export interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pageSize?: number;
	showPagination?: boolean;
	onRowsSelected?: (rows: TData[]) => void;
	onTableReady?: (table: ReactTable<TData>) => void;
	currentPage?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	pageSize = 10,
	showPagination = true,
	onRowsSelected,
	onTableReady,
	currentPage = 1,
	totalPages = 1,
	onPageChange,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	// Set page size
	React.useEffect(() => {
		table.setPageSize(pageSize);
	}, [pageSize, table]);

	// Handle row selection callback
	React.useEffect(() => {
		if (onRowsSelected) {
			const selectedRows = table
				.getFilteredSelectedRowModel()
				.rows.map((row) => row.original);
			onRowsSelected(selectedRows);
		}
	}, [rowSelection, table, onRowsSelected]);

	// Call onTableReady if provided
	React.useEffect(() => {
		if (onTableReady) {
			onTableReady(table);
		}
	}, [table, onTableReady]);

	// Handle next page button click
	const handleNextPage = () => {
		if (currentPage < totalPages && onPageChange) {
			onPageChange(currentPage + 1);
		}
	};

	// Handle previous page button click
	const handlePreviousPage = () => {
		if (currentPage > 1 && onPageChange) {
			onPageChange(currentPage - 1);
		}
	};

	// Generate page numbers for pagination
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisible = 5; // Show max 5 page buttons
		let startPage = 1;
		let endPage = totalPages;

		if (totalPages > maxVisible) {
			if (currentPage <= 3) {
				endPage = maxVisible;
			} else if (currentPage >= totalPages - 2) {
				startPage = totalPages - maxVisible + 1;
			} else {
				startPage = currentPage - 2;
				endPage = currentPage + 2;
			}
		}

		if (startPage > 1) {
			pages.push(1);
			if (startPage > 2) {
				pages.push('...');
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}

		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				pages.push('...');
			}
			pages.push(totalPages);
		}

		return pages;
	};

	return (
		<>
			<div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
				<div className='w-full space-y-4'>
					{/* Table */}
					<div className='overflow-hidden'>
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow
										key={headerGroup.id}
										className='border-gray-200 bg-gray-100 hover:bg-gray-100'>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead
													key={header.id}
													className='text-gray-900 font-semibold'>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext()
														  )}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && 'selected'}
											className='border-gray-200 hover:bg-gray-50 text-gray-900'>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className='h-24 text-center text-gray-500'>
											No results found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>

			{showPagination && (
				<div className='flex items-center justify-between mt-4 px-2'>
					<div className='text-xs text-gray-600'>
						Page <span className='font-semibold'>{currentPage}</span> of{' '}
						<span className='font-semibold'>{totalPages}</span>
					</div>
					<nav className='flex'>
						<ul className='inline-flex items-center gap-1'>
							{/* Previous Button */}
							<li>
								<button
									onClick={handlePreviousPage}
									disabled={currentPage <= 1}
									className='px-2 py-1 text-xs border border-purple-200 bg-purple-50 text-purple-900 rounded hover:bg-purple-100 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium'>
									Prev
								</button>
							</li>

							{/* Page Numbers */}
							{getPageNumbers().map((page, idx) => (
								<li key={idx}>
									{page === '...' ? (
										<span className='px-2 py-1 text-xs text-gray-500'>
											{page}
										</span>
									) : (
										<button
											onClick={() => {
												if (typeof page === 'number' && onPageChange) {
													onPageChange(page);
												}
											}}
											disabled={typeof page !== 'number'}
											className={`px-2 py-1 text-xs border rounded transition-colors font-medium ${
												currentPage === page
													? 'bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 hover:from-purple-950 hover:via-purple-750 hover:to-purple-550 border-purple-700 text-white'
													: 'border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100 hover:border-purple-300'
											} disabled:opacity-50 disabled:cursor-not-allowed`}>
											{page}
										</button>
									)}
								</li>
							))}

							{/* Next Button */}
							<li>
								<button
									onClick={handleNextPage}
									disabled={currentPage >= totalPages}
									className='px-2 py-1 text-xs border border-purple-200 bg-purple-50 text-purple-900 rounded hover:bg-purple-100 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium'>
									Next
								</button>
							</li>
						</ul>
					</nav>
				</div>
			)}
		</>
	);
}
