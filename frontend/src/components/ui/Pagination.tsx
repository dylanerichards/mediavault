import React from 'react';
import type { PaginationMeta } from '../../types/api';
import Button from './Button';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange
}) => {
  const { current_page, total_pages, has_prev, has_next } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, current_page - 2);
    const endPage = Math.min(total_pages, current_page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (total_pages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <Button
          onClick={() => onPageChange(current_page - 1)}
          disabled={!has_prev}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <Button
          onClick={() => onPageChange(current_page + 1)}
          disabled={!has_next}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{current_page}</span> of{' '}
            <span className="font-medium">{total_pages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <Button
              onClick={() => onPageChange(current_page - 1)}
              disabled={!has_prev}
              variant="outline"
              size="sm"
              className="rounded-l-md"
            >
              Previous
            </Button>

            {getPageNumbers().map((page) => (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                variant={page === current_page ? 'primary' : 'outline'}
                size="sm"
                className="rounded-none"
              >
                {page}
              </Button>
            ))}

            <Button
              onClick={() => onPageChange(current_page + 1)}
              disabled={!has_next}
              variant="outline"
              size="sm"
              className="rounded-r-md"
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;