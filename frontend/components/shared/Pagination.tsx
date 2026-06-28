"use client";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  size: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, pages, total, size, onPage }: PaginationProps) {
  const start = Math.min((page - 1) * size + 1, total);
  const end = Math.min(page * size, total);

  // Compute page numbers to show: always first, last, and around current
  const getPageNums = () => {
    const range: (number | "...")[] = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  };

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {start}–{end} of {total} hosted zones
      </span>
      <div className="pagination-controls">
        <button
          className="page-btn"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        {getPageNums().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "var(--text-muted)" }}>
              …
            </span>
          ) : (
            <button
              key={p}
              className={`page-btn ${p === page ? "active" : ""}`}
              onClick={() => onPage(p as number)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="page-btn"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}
