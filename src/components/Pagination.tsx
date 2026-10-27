import { useId } from "react";
import { Icon } from "./Icon";
import "./Pagination.css";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizes: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * Page numbers to show. Up to 7 pages: all of them. More: the first and last, the current one and its
 * neighbours, and "…" for the gaps.
 */
function pageList(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (["gap", p] as const) : [p]));
}

/** Table footer: "Showing x–y of z", rows per page and page buttons. */
export function Pagination({ page, pageSize, total, pageSizes, onPageChange, onPageSizeChange }: PaginationProps) {
  const sizeId = useId();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <p className="pagination__summary">
        Showing {from}–{to} of {total}
      </p>
      <div className="pagination__controls">
        <div className="pagination__size">
          <label htmlFor={sizeId}>Rows per page:</label>
          <select id={sizeId} value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <nav aria-label="Pages">
          <ul className="pagination__pages">
            <li>
              <button
                type="button"
                className="pagination__step"
                aria-label="Previous page"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
              >
                <Icon name="chevron-down" className="pagination__prev" />
              </button>
            </li>
            {pageList(page, pageCount).map((p, i) =>
              p === "gap" ? (
                <li key={`gap-${i}`} className="pagination__gap" aria-hidden="true">
                  …
                </li>
              ) : (
                <li key={p}>
                  <button
                    type="button"
                    className="pagination__page"
                    aria-current={p === page ? "page" : undefined}
                    aria-label={`Page ${p}`}
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </button>
                </li>
              ),
            )}
            <li>
              <button
                type="button"
                className="pagination__step"
                aria-label="Next page"
                disabled={page === pageCount}
                onClick={() => onPageChange(page + 1)}
              >
                <Icon name="chevron-down" className="pagination__next" />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
