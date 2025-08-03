import React from 'react';
import { CategoryInfo } from '../types/blog.types';
import { useAnalytics } from '../utils/analytics';

interface CategoryFilterProps {
  categories: CategoryInfo[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  totalPosts: number;
  className?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  totalPosts,
  className = ''
}) => {
  const { trackCategoryFilter } = useAnalytics();
  
  const handleCategoryClick = (category: string | null) => {
    onCategoryChange(category);
    
    // Track category filter usage
    const categoryName = category || 'all';
    const resultsCount = category 
      ? categories.find(cat => cat.name === category)?.postCount || 0 
      : totalPosts;
    
    trackCategoryFilter(categoryName, resultsCount);
  };

  const handleKeyDown = (event: React.KeyboardEvent, category: string | null) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCategoryClick(category);
    }
  };

  return (
    <div className={`${className}`}>
      {/* Mobile: Horizontal scrolling container */}
      <div className="overflow-x-auto scrollbar-hide py-2 px-1">
        <div className="flex gap-3 md:gap-4 min-w-max md:min-w-0 md:flex-wrap">
          {/* All Posts Button */}
          <button
            onClick={() => handleCategoryClick(null)}
            onKeyDown={(e) => handleKeyDown(e, null)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-chess-dark-primary
              transform hover:scale-105 active:scale-95
              ${activeCategory === null
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-chess-dark-secondary text-slate-300 hover:bg-chess-dark-tertiary hover:text-white border border-chess-dark-tertiary'
              }
            `}
            aria-pressed={activeCategory === null}
            role="button"
          >
            All
            <span className="ml-2 text-xs opacity-80">
              {totalPosts}
            </span>
          </button>

          {/* Category Buttons */}
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              onKeyDown={(e) => handleKeyDown(e, category.name)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-chess-dark-primary
                transform hover:scale-105 active:scale-95
                ${activeCategory === category.name
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-chess-dark-secondary text-slate-300 hover:bg-chess-dark-tertiary hover:text-white border border-chess-dark-tertiary'
                }
              `}
              aria-pressed={activeCategory === category.name}
              role="button"
            >
              {category.displayName}
              <span className="ml-2 text-xs opacity-80">
                {category.postCount}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;