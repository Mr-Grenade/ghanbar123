import { CustomSelect } from "./ui/custom-select";
import React from "react";
import { toPersianDigits } from "../utils/persianDate";
import {
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = "مورد",
  className = "",
}) => {
  const isShowAll = pageSize === -1 || pageSize >= totalItems;
  const effectivePageSize = isShowAll ? Math.max(1, totalItems) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));

  const startItem =
    totalItems === 0 ? 0 : isShowAll ? 1 : (currentPage - 1) * pageSize + 1;
  const endItem = isShowAll
    ? totalItems
    : Math.min(totalItems, currentPage * pageSize);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div
      className={`p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none ${className}`}
    >
      {/* Right Side: Total Count & Range */}
      <div className="flex items-center gap-3 text-[var(--text-secondary)] font-medium">
        <span>
          نمایش{" "}
          <strong className="text-[var(--text-primary)] font-bold">
            {toPersianDigits(startItem)}
          </strong>{" "}
          تا{" "}
          <strong className="text-[var(--text-primary)] font-bold">
            {toPersianDigits(endItem)}
          </strong>{" "}
          از{" "}
          <strong className="text-[var(--text-primary)] font-bold">
            {toPersianDigits(totalItems)}
          </strong>{" "}
          {itemLabel}
        </span>

        {/* Per page selector */}
        <div className="flex items-center gap-1.5 mr-2">
          <label
            htmlFor="select-page-size"
            className="text-[11px] text-[var(--text-muted)] font-semibold"
          >
            تعداد در صفحه:
          </label>
          <CustomSelect
            id="select-page-size"
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              onPageSizeChange(newSize);
              onPageChange(1);
            }}
            className="px-2 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {pageSizeOptions.map((opt) => (
              <option
                key={opt}
                value={opt}
                className="bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              >
                {toPersianDigits(opt)}
              </option>
            ))}
            <option
              value={-1}
              className="bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            >
              همه
            </option>
          </CustomSelect>
        </div>
      </div>

      {/* Left Side: Navigation Controls */}
      {!isShowAll && totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First Page (Chevrons Right in RTL) */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`p-1.5 rounded-lg border border-[var(--border-color)] transition-all ${
              currentPage === 1
                ? "opacity-40 cursor-not-allowed bg-transparent text-[var(--text-muted)]"
                : "bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
            }`}
            title="صفحه اول"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-1.5 rounded-lg border border-[var(--border-color)] transition-all ${
              currentPage === 1
                ? "opacity-40 cursor-not-allowed bg-transparent text-[var(--text-muted)]"
                : "bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
            }`}
            title="صفحه قبل"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((item, idx) => {
              if (item === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-[var(--text-muted)] font-mono text-xs select-none"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = item === currentPage;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  className={`min-w-[30px] h-[30px] px-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center ${
                    isCurrent
                      ? "bg-accent text-on-solid shadow-xs scale-105 ring-1 ring-accent"
                      : "bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] border border-[var(--border-color)]"
                  }`}
                >
                  {toPersianDigits(item)}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-1.5 rounded-lg border border-[var(--border-color)] transition-all ${
              currentPage === totalPages
                ? "opacity-40 cursor-not-allowed bg-transparent text-[var(--text-muted)]"
                : "bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
            }`}
            title="صفحه بعد"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Last Page (Chevrons Left in RTL) */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-1.5 rounded-lg border border-[var(--border-color)] transition-all ${
              currentPage === totalPages
                ? "opacity-40 cursor-not-allowed bg-transparent text-[var(--text-muted)]"
                : "bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
            }`}
            title="صفحه آخر"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
