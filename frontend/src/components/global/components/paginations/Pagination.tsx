import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Table } from "@tanstack/react-table"

export interface PaginationProps<TData> {
  className?: string
  table: Table<TData>
}

export function Pagination<TData>({ table, className }: PaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = table.getFilteredRowModel().rows.length

  return (
    <div className={cn("flex items-center justify-between px-2 pb-6 mt-3", className)}>
      <div className="text-sm text-gray-600">
        {selectedCount} of {totalCount} row(s) selected.
      </div>
      <div className="space-x-2 flex">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="bg-white border-gray-300 text-gray-900 hover:bg-gray-100 disabled:opacity-50"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-white border-gray-300 text-gray-900 hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
