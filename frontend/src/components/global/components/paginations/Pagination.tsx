import { cn } from "@/lib/utils"
import type { Table } from "@tanstack/react-table"
import React from "react"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface PaginationProps<TData> {
  className?: string
  table: Table<TData>
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function Pagination<TData>({ table, className, currentPage: externalCurrentPage, totalPages: externalTotalPages, onPageChange }: PaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = table.getRowModel().rows.length
  
  // Use external pagination if provided, otherwise use table's internal pagination
  const pageCount = externalTotalPages ?? table.getPageCount()
  const currentPage = externalCurrentPage ?? (table.getState().pagination.pageIndex + 1)

  // Generate page numbers for pagination
  const pageNumbers = React.useMemo(() => {
    const pages: (number | string)[] = []
    const maxVisible = 3
    let startPage = 1
    let endPage = pageCount

    if (pageCount > maxVisible) {
      if (currentPage <= 2) {
        endPage = maxVisible
      } else if (currentPage >= pageCount - 1) {
        startPage = pageCount - maxVisible + 1
      } else {
        startPage = currentPage - 1
        endPage = currentPage + 1
      }
    }

    if (startPage > 1) {
      pages.push('...')
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < pageCount) {
      pages.push('...')
    }

    return pages
  }, [pageCount, currentPage])

  return (
    <div className={cn("flex items-center justify-between mt-4 px-2", className)}>
      <div className="text-xs text-gray-600">
        <span className="font-semibold">{selectedCount}</span> of <span className="font-semibold">{totalCount}</span> row(s) selected.
      </div>
      <nav className="flex">
        <ul className="inline-flex items-center gap-1">
          {/* Previous Button */}
          <li>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      if (onPageChange && externalCurrentPage !== undefined) {
                        onPageChange(externalCurrentPage - 1)
                      } else {
                        table.previousPage()
                      }
                    }}
                    disabled={externalCurrentPage !== undefined ? externalCurrentPage <= 1 : !table.getCanPreviousPage()}
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 border border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100 hover:border-purple-300 hover:text-purple-950 disabled:opacity-50 rounded-full p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous Page</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </li>

          {/* Page Numbers */}
          {pageNumbers.map((page, idx) => (
            <li key={idx}>
              {page === '...' ? (
                <span className="px-1 py-1 text-xs text-gray-500">
                  {page}
                </span>
              ) : (
                <Button
                  onClick={() => {
                    if (typeof page === 'number') {
                      if (onPageChange && externalCurrentPage !== undefined) {
                        onPageChange(page)
                      } else {
                        table.setPageIndex(page - 1)
                      }
                    }
                  }}
                  disabled={typeof page !== 'number'}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'w-7 h-7 rounded-full transition-all duration-200 font-medium p-0',
                    currentPage === page
                      ? 'bg-linear-to-br from-purple-900 via-purple-700 to-purple-500 hover:from-purple-950 hover:via-purple-750 hover:to-purple-550 border border-purple-700 text-white transform -translate-y-1 shadow-lg'
                      : 'border border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100 hover:border-purple-300 transform hover:-translate-y-0.5'
                  )}
                >
                  {page}
                </Button>
              )}
            </li>
          ))}

          {/* Next Button */}
          <li>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      if (onPageChange && externalCurrentPage !== undefined) {
                        onPageChange(externalCurrentPage + 1)
                      } else {
                        table.nextPage()
                      }
                    }}
                    disabled={externalCurrentPage !== undefined ? externalCurrentPage >= pageCount : !table.getCanNextPage()}
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 border border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100 hover:border-purple-300 hover:text-purple-950 disabled:opacity-50 rounded-full p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next Page</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </nav>
    </div>
  )
}
