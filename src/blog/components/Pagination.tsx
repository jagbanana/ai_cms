import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = ''
}: PaginationProps) {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
    scrollToTop();
  };

  // Generate page numbers with ellipsis
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <nav 
      className={`flex items-center justify-center space-x-2 ${className}`}
      aria-label="Pagination Navigation"
    >
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-md
          ${currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
          }
        `}
        aria-label="Go to previous page"
      >
        <ChevronLeftIcon className="h-4 w-4 mr-1" />
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-400">...</span>
            ) : (
              <button
                onClick={() => handlePageChange(page as number)}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md min-w-[40px]
                  ${currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }
                `}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-md
          ${currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
          }
        `}
        aria-label="Go to next page"
      >
        Next
        <ChevronRightIcon className="h-4 w-4 ml-1" />
      </button>
    </nav>
  );
}

export default Pagination;