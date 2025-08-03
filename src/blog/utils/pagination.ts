import { ProcessedBlogPost } from '../types/blog.types';

export interface PaginationResult<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalItems: number;
}

/**
 * Paginate an array of items
 */
export function paginate<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    totalItems
  };
}

/**
 * Get pagination info for blog posts
 */
export function paginateBlogPosts(
  posts: ProcessedBlogPost[],
  currentPage: number,
  postsPerPage: number = 12
): PaginationResult<ProcessedBlogPost> {
  return paginate(posts, currentPage, postsPerPage);
}

/**
 * Parse page number from URL parameter
 */
export function parsePageFromUrl(pageParam: string | null): number {
  if (!pageParam) return 1;
  
  const page = parseInt(pageParam, 10);
  return isNaN(page) || page < 1 ? 1 : page;
}

/**
 * Generate URL search params for pagination
 */
export function generatePaginationParams(
  currentParams: URLSearchParams,
  newPage: number
): URLSearchParams {
  const params = new URLSearchParams(currentParams);
  
  if (newPage <= 1) {
    params.delete('page');
  } else {
    params.set('page', newPage.toString());
  }
  
  return params;
}