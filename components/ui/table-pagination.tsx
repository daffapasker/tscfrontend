"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Called when the page changes */
  onPageChange: (page: number) => void;
  /** Total item count (optional, shown as "X dari Y item") */
  totalItems?: number;
  /** Items per page (optional, used in the label) */
  pageSize?: number;
  /** Extra className for the wrapper */
  className?: string;
}

/**
 * Reusable table pagination bar.
 *
 * Usage:
 * ```tsx
 * <TablePagination
 *   currentPage={page}
 *   totalPages={Math.ceil(total / PAGE_SIZE)}
 *   onPageChange={setPage}
 *   totalItems={total}
 *   pageSize={PAGE_SIZE}
 * />
 * ```
 */
export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className,
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  // Build the page numbers to show (max 5 visible pages with ellipsis)
  const pages = buildPageNumbers(currentPage, totalPages);

  const startItem = totalItems != null && pageSize != null
    ? (currentPage - 1) * pageSize + 1
    : null;
  const endItem = totalItems != null && pageSize != null
    ? Math.min(currentPage * pageSize, totalItems)
    : null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-border/40",
        className
      )}
    >
      {/* Info label */}
      <div className="text-[12px] text-muted-foreground tabular-nums">
        {startItem != null && endItem != null && totalItems != null ? (
          <>
            Menampilkan <span className="font-medium text-foreground">{startItem}–{endItem}</span> dari{" "}
            <span className="font-medium text-foreground">{totalItems}</span> data
          </>
        ) : (
          <>
            Halaman <span className="font-medium text-foreground">{currentPage}</span> dari{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </>
        )}
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Halaman pertama"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>

        {/* Previous page */}
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Halaman sebelumnya"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="h-7 w-7 flex items-center justify-center text-[12px] text-muted-foreground/60 select-none"
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "h-7 min-w-[28px] px-1 rounded-md text-[12px] font-medium transition-colors",
                currentPage === p
                  ? "bg-violet-600 text-white border border-violet-600 shadow-sm"
                  : "border border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next page */}
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Halaman berikutnya"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Last page */}
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Halaman terakhir"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Build an array of page numbers + "..." ellipsis markers. */
function buildPageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  if (current <= 4) {
    // Near start: 1 2 3 4 5 ... last
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  } else if (current >= total - 3) {
    // Near end: 1 ... last-4 last-3 last-2 last-1 last
    pages.push(1);
    pages.push("...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    // Middle: 1 ... cur-1 cur cur+1 ... last
    pages.push(1);
    pages.push("...");
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push("...");
    pages.push(total);
  }

  return pages;
}

export default TablePagination;
