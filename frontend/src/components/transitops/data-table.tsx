import { type ReactNode, useEffect, useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpZA, ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/transitops/empty-state";

export type DataTableColumn<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => ReactNode;
  searchAccessor?: (row: T) => string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
};

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  emptyTitle = "No records",
  emptyDescription = "Try adjusting your filters or search.",
  pageSize = 8,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const searchableRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      columns.some((column) => {
        const value =
          column.searchAccessor?.(row) ??
          String((row as Record<string, unknown>)[String(column.key)] ?? "");
        return value.toLowerCase().includes(normalizedQuery);
      }),
    );
  }, [columns, rows, searchQuery]);

  const sortedRows = useMemo(() => {
    if (!sortKey) {
      return searchableRows;
    }

    return [...searchableRows].sort((a, b) => {
      const first = (a as Record<string, unknown>)[sortKey];
      const second = (b as Record<string, unknown>)[sortKey];

      const firstValue = typeof first === "number" ? first : String(first ?? "").toLowerCase();
      const secondValue = typeof second === "number" ? second : String(second ?? "").toLowerCase();

      if (firstValue === secondValue) {
        return 0;
      }

      const result = firstValue > secondValue ? 1 : -1;
      return sortDirection === "asc" ? result : -result;
    });
  }, [searchableRows, sortDirection, sortKey]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortKey, sortDirection, rows.length]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function onSort(column: DataTableColumn<T>) {
    const key = String(column.key);
    if (!column.sortable) {
      return;
    }

    if (sortKey === key) {
      setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} icon={SearchX} />;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:flex sm:items-center sm:justify-between">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search in table..."
          className="h-9 w-full sm:max-w-xs"
        />
        <p className="text-xs text-muted-foreground">{sortedRows.length} matching records</p>
      </div>

      {sortedRows.length === 0 ? (
        <EmptyState
          title="No matching records"
          description="Try a different keyword to find matching rows."
          icon={SearchX}
        />
      ) : null}

      {sortedRows.length > 0 ? (
        <>
          <div className="md:hidden space-y-2">
            {pagedRows.map((row) => (
              <article
                key={getRowId(row)}
                className="rounded-lg border border-border/70 bg-card p-3 transition-colors active:bg-accent/40"
              >
                <div className="space-y-2">
                  {columns.map((column) => (
                    <div
                      key={`${getRowId(row)}-${String(column.key)}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-3"
                    >
                      <p className="text-xs font-medium text-muted-foreground">{column.label}</p>
                      <div className="text-sm text-right">
                        {column.render
                          ? column.render(row)
                          : String((row as Record<string, unknown>)[String(column.key)] ?? "-")}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="hidden rounded-lg border border-border/70 md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={String(column.key)} className={column.className}>
                        {column.sortable ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-0 py-0 text-muted-foreground hover:bg-transparent"
                            onClick={() => onSort(column)}
                          >
                            {column.label}
                            {sortKey === String(column.key) ? (
                              sortDirection === "asc" ? (
                                <ArrowDownAZ className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowUpZA className="h-3.5 w-3.5" />
                              )
                            ) : (
                              <ArrowDownAZ className="h-3.5 w-3.5 opacity-50" />
                            )}
                          </Button>
                        ) : (
                          column.label
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedRows.map((row) => (
                    <TableRow key={getRowId(row)} className="transition-colors hover:bg-accent/60">
                      {columns.map((column) => (
                        <TableCell
                          key={`${getRowId(row)}-${String(column.key)}`}
                          className={column.className}
                        >
                          {column.render
                            ? column.render(row)
                            : String((row as Record<string, unknown>)[String(column.key)] ?? "-")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid gap-2 sm:flex sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full sm:w-auto"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full sm:w-auto"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
