import React from 'react';
import type { Table as ReactTable } from '@tanstack/react-table';

/**
 * Custom hook to clear table row selection
 * Useful for resetting selection state after bulk operations
 */
export const useClearTableSelection = () => {
	const tableRef = React.useRef<ReactTable<any> | null>(null);

	const setTable = React.useCallback((table: ReactTable<any>) => {
		tableRef.current = table;
	}, []);

	const clearSelection = React.useCallback(() => {
		if (tableRef.current) {
			tableRef.current.resetRowSelection();
		}
	}, []);

	return { setTable, clearSelection };
};

