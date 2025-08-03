import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../utils/analytics';

interface BlogSearchProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
  resultsCount?: number;
}

export function BlogSearch({ 
  onSearchChange, 
  placeholder = "Search resources...",
  className = "",
  resultsCount = 0
}: BlogSearchProps) {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const isUserInputRef = useRef(false);
  const { trackResourceSearch } = useAnalytics();
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      // Only notify parent component, let parent handle URL updates
      onSearchChange(searchQuery);
      
      // Track search event if query is not empty
      if (searchQuery.trim()) {
        trackResourceSearch(searchQuery.trim(), resultsCount);
      }
      
      // Reset the user input flag after debounce completes
      isUserInputRef.current = false;
    }, 300),
    [onSearchChange, trackResourceSearch, resultsCount]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    isUserInputRef.current = true; // Mark as user input
    debouncedSearch(value);
  };

  // Handle clear button
  const handleClear = () => {
    setQuery('');
    isUserInputRef.current = true; // Mark as user action
    debouncedSearch('');
  };

  // Sync with URL changes only when they come from external sources
  useEffect(() => {
    const urlQuery = searchParams.get('search') || '';
    // Only update input if this is not from user input
    if (!isUserInputRef.current && urlQuery !== query) {
      setQuery(urlQuery);
      onSearchChange(urlQuery);
    }
  }, [searchParams, query, onSearchChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          className="block w-full rounded-md border-0 bg-chess-dark-secondary py-2 pl-10 pr-10 text-white shadow-sm ring-1 ring-inset ring-chess-dark-tertiary placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
          placeholder={placeholder}
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-chess-dark-tertiary rounded-r-md transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-slate-400 hover:text-slate-200" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}