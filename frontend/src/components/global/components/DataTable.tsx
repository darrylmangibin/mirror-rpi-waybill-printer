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
import { ShimmerSkeleton } from '@/components/global/components/loaders';
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
	isLoading?: boolean;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	pageSize = 10,
	showPagination = true,
	onRowsSelected,
	onTableReady,
	currentPage,
	totalPages,
	onPageChange,
	isLoading,
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
	}, [rowSelection, onRowsSelected]);

	// Call onTableReady if provided
	React.useEffect(() => {
		if (onTableReady) {
			onTableReady(table);
		}
	}, [table, onTableReady]);

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
								{isLoading ? (
									<>
										{[...Array(5)].map((_, rowIdx) => (
											<TableRow key={`skeleton-${rowIdx}`}>
												{columns.map((_, colIdx) => (
													<TableCell key={`skeleton-cell-${rowIdx}-${colIdx}`} className='py-2'>
														<ShimmerSkeleton className='h-6 w-full' />
													</TableCell>
												))}
											</TableRow>
										))}
									</>
								) : table.getRowModel().rows?.length ? (
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

			{showPagination && <Pagination table={table} currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} isLoading={isLoading} />}
		</>
	);
}
