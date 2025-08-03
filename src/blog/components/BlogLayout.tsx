import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import { useAnalytics } from '../utils/analytics';
// import { initializeWebVitals, BLOG_PERFORMANCE_BUDGET } from '../utils/web-vitals';
// import { PerformanceMonitor } from './PerformanceMonitor';

interface BlogLayoutProps {
  children?: React.ReactNode;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { trackCTAClick } = useAnalytics();

  // Initialize Web Vitals monitoring - temporarily disabled
  // useEffect(() => {
  //   initializeWebVitals(BLOG_PERFORMANCE_BUDGET);
  // }, []);

  const handleCTAClick = (ctaName: string, targetPath: string) => {
    trackCTAClick(ctaName, 'blog-footer');
    navigate(targetPath);
  };

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

      {/* Blog Footer with CTAs */}
      <footer className="bg-chess-dark-secondary border-t border-chess-dark-tertiary mt-8 sm:mt-12">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Call-to-Action Section */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* CTA 1: Start Learning Chess */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 sm:p-6 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Start Learning Chess
              </h3>
              <p className="text-sm sm:text-base text-blue-100 mb-4">
                Master chess fundamentals with our structured curriculum
              </p>
              <button
                onClick={() => handleCTAClick('explore-lessons', '/curriculum')}
                className="bg-white text-blue-700 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors min-h-[44px] touch-manipulation"
              >
                Explore Lessons
              </button>
            </div>

            {/* CTA 2: Try Free Lessons */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 sm:p-6 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Try Our Free Lessons
              </h3>
              <p className="text-sm sm:text-base text-green-100 mb-4">
                Get started with interactive chess training right away
              </p>
              <button
                onClick={() => handleCTAClick('start-playing', '/practice')}
                className="bg-white text-green-700 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors min-h-[44px] touch-manipulation"
              >
                Start Playing
              </button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="border-t border-chess-dark-tertiary pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-slate-400">
                © {new Date().getFullYear()} <a href="https://chesstrainer.org/" className="text-blue-400 hover:text-blue-300 underline">chesstrainer.org</a> Resources. Learn chess systematically.
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-400">
                <button
                  onClick={() => navigate('/resources')}
                  className="hover:text-slate-300 transition-colors"
                >
                  All Posts
                </button>
                <button
                  onClick={() => navigate('/resources/tips')}
                  className="hover:text-slate-300 transition-colors"
                >
                  Tips
                </button>
                <button
                  onClick={() => navigate('/resources/guides')}
                  className="hover:text-slate-300 transition-colors"
                >
                  Guides
                </button>
                <button
                  onClick={() => navigate('/resources/news')}
                  className="hover:text-slate-300 transition-colors"
                >
                  News
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Performance Monitor (development only) - temporarily disabled for debugging */}
      {/* <PerformanceMonitor budget={BLOG_PERFORMANCE_BUDGET} /> */}

    </div>
  );
};

export default BlogLayout;