import React from 'react';
import { Outlet } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
// import { initializeWebVitals, BLOG_PERFORMANCE_BUDGET } from '../utils/web-vitals';
// import { PerformanceMonitor } from './PerformanceMonitor';

interface BlogLayoutProps {
  children?: React.ReactNode;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({ children }) => {
  // Initialize Web Vitals monitoring - temporarily disabled
  // useEffect(() => {
  //   initializeWebVitals(BLOG_PERFORMANCE_BUDGET);
  // }, []);

  return (
    <div className="min-h-screen bg-chess-dark-primary">

      {/* Breadcrumb Navigation */}
      <div className="bg-chess-dark-primary border-b border-chess-dark-tertiary">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="py-3">
            <Breadcrumbs maxItems={4} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="py-4 sm:py-6 lg:py-8">
            {/* Content with proper max-width for readability */}
            <div className="max-w-4xl mx-auto">
              {children || <Outlet />}
            </div>
          </div>
        </div>
      </main>


      {/* Performance Monitor (development only) - temporarily disabled for debugging */}
      {/* <PerformanceMonitor budget={BLOG_PERFORMANCE_BUDGET} /> */}

    </div>
  );
};

export default BlogLayout;