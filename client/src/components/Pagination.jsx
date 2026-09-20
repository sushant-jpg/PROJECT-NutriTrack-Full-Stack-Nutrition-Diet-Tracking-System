import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;
  return (
    <div className="pagination" aria-label="Pagination">
      <span>{total} records</span>
      <div>
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page"><ChevronLeft size={17} /></button>
        <span>Page {page} of {pages}</span>
        <button type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Next page"><ChevronRight size={17} /></button>
      </div>
    </div>
  );
}

