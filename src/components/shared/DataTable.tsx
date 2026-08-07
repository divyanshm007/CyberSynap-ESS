import { useState } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, getFilteredRowModel,
  flexRender, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Skeleton } from './Skeleton';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  className?: string;
}

export default function DataTable<T>({
  data, columns, loading, searchPlaceholder = 'Search…', pageSize = 10, className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const { pageIndex, pageSize: ps } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  const from = pageIndex * ps + 1;
  const to = Math.min(from + ps - 1, total);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--plasma)] transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b border-[var(--border)] bg-[var(--raised)]">
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:text-[var(--text)]',
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-[var(--border)]">
                          {header.column.getIsSorted() === 'asc' ? <ChevronUp size={12} /> :
                           header.column.getIsSorted() === 'desc' ? <ChevronDown size={12} /> :
                           <ChevronsUpDown size={12} />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-sm text-[var(--text-muted)]">
                  No records found.
                </td>
              </tr>
            ) : table.getRowModel().rows.map(row => (
              <tr key={row.id} className="bg-[var(--surface)] hover:bg-[var(--raised)] transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 text-[var(--text)]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > ps && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)] tabular-nums">
            Showing {from}–{to} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-40 hover:bg-[var(--raised)] transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={cn(
                  'w-7 h-7 rounded-lg text-xs font-medium transition-colors',
                  pageIndex === i
                    ? 'bg-[var(--plasma)] text-white'
                    : 'border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--raised)]',
                )}
              >
                {i + 1}
              </button>
            )).slice(Math.max(0, pageIndex - 2), pageIndex + 3)}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-40 hover:bg-[var(--raised)] transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
