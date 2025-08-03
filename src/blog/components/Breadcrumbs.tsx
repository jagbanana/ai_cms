import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBlogPost } from '../contexts/BlogPostContext';

// Simple SVG icon components
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const HomeIcon: React.FC<{ className?: string; 'aria-label'?: string }> = ({ className, 'aria-label': ariaLabel }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-label={ariaLabel}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrentPage: boolean;
}

interface BreadcrumbsProps {
  maxItems?: number; // For mobile truncation
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  maxItems = 4, 
  className = '' 
}) => {
  const location = useLocation();
  const { currentPost } = useBlogPost();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Home
    breadcrumbs.push({
      label: 'Home',
      path: '/',
      isCurrentPage: false,
    });

    // Handle different URL patterns
    if (pathSegments.length === 0) {
      // We're on home page
      breadcrumbs[0].isCurrentPage = true;
      return breadcrumbs;
    }

    // Check if we're in the blog/resources area
    if (pathSegments[0] === 'resources') {
      // Add Resources breadcrumb
      breadcrumbs.push({
        label: 'Resources',
        path: '/resources',
        isCurrentPage: pathSegments.length === 1,
      });

      if (pathSegments.length >= 2) {
        const category = pathSegments[1];
        
        // Category names mapping
        const categoryNames: Record<string, string> = {
          tips: 'Tips',
          guides: 'Guides',
          news: 'News',
        };

        // Add category breadcrumb if it's a known category
        if (categoryNames[category]) {
          breadcrumbs.push({
            label: categoryNames[category],
            path: `/resources/${category}`,
            isCurrentPage: pathSegments.length === 2,
          });

          // Add post title if we're on a specific post
          if (pathSegments.length === 3) {
            const postSlug = pathSegments[2];
            // Use actual post title if available from context, otherwise convert slug
            const postTitle = currentPost?.frontmatter?.title || postSlug
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            breadcrumbs.push({
              label: postTitle,
              path: location.pathname,
              isCurrentPage: true,
            });
          }
        } else {
          // This might be a landing page slug directly under resources
          // Use actual post title if available from context, otherwise convert slug
          const pageTitle = currentPost?.frontmatter?.title || category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          breadcrumbs.push({
            label: pageTitle,
            path: location.pathname,
            isCurrentPage: true,
          });
        }
      }
    } else {
      // Landing page (e.g., /best-chess-apps-2025)
      const pageSlug = pathSegments[0];
      // Use actual post title if available from context, otherwise convert slug
      const pageTitle = currentPost?.frontmatter?.title || pageSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label: pageTitle,
        path: location.pathname,
        isCurrentPage: true,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Handle mobile truncation
  const shouldTruncate = breadcrumbs.length > maxItems;
  const displayBreadcrumbs = shouldTruncate
    ? [
        breadcrumbs[0], // Always show Home
        { label: '...', path: '', isCurrentPage: false }, // Ellipsis
        ...breadcrumbs.slice(-2), // Show last 2 items
      ]
    : breadcrumbs;

  return (
    <nav 
      aria-label="Breadcrumb navigation"
      className={`${className}`}
    >
      <ol className="flex items-center space-x-1 text-sm">
        {displayBreadcrumbs.map((item, index) => {
          const isEllipsis = item.label === '...';

          return (
            <li key={`${item.path}-${index}`} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon 
                  className="w-4 h-4 text-slate-500 mx-1 flex-shrink-0" 
                  aria-hidden="true"
                />
              )}
              
              {isEllipsis ? (
                <span 
                  className="text-slate-500 px-2"
                  aria-hidden="true"
                >
                  ...
                </span>
              ) : item.isCurrentPage ? (
                <span 
                  className="text-slate-300 font-medium"
                  aria-current="page"
                >
                  {/* Show home icon for home page */}
                  {item.label === 'Home' && index === 0 ? (
                    <HomeIcon className="w-4 h-4" aria-label="Home" />
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-slate-400 hover:text-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-chess-dark-primary rounded-sm px-1"
                >
                  {/* Show home icon for home page */}
                  {item.label === 'Home' && index === 0 ? (
                    <HomeIcon className="w-4 h-4" aria-label="Home" />
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;