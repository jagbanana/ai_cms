import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import BlogLayout for consistent layout across all blog pages
import BlogLayout from '../components/BlogLayout';
import { BlogErrorBoundary } from '../components/BlogErrorBoundary';

// Lazy load blog page components for performance
const BlogHome = React.lazy(() => import('../pages/BlogHome'));
const CategoryPage = React.lazy(() => import('../pages/CategoryPage'));
const BlogPostPage = React.lazy(() => import('../pages/BlogPostPage'));
const BlogNotFound = React.lazy(() => import('../pages/BlogNotFound'));

// Loading component for lazy loaded blog routes
const BlogPageLoader: React.FC<{ pageName: string }> = ({ pageName }) => (
  <div className="min-h-screen bg-chess-dark-primary flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-slate-300">Loading {pageName}...</p>
    </div>
  </div>
);

/**
 * BlogRoutes Component
 * 
 * Handles all resources (blog) routing with the following URL patterns:
 * - /resources - Resources homepage
 * - /resources/tips - Category page for tips
 * - /resources/guides - Category page for guides  
 * - /resources/news - Category page for news
 * - /resources/tips/some-post - Category post
 * - /resources/guides/some-guide - Category post
 * - /resources/news/some-announcement - Category post
 * - /best-chess-apps-2025 - Landing page (no category)
 * - /any-other-slug - Landing page (no category)
 */
const BlogRoutes: React.FC = () => {
  return (
    <BlogErrorBoundary>
      <BlogLayout>
        <Suspense fallback={<BlogPageLoader pageName="blog" />}>
          <Routes>
            {/* Resources homepage: /resources */}
            <Route 
              index 
              element={
                <BlogErrorBoundary>
                  <Suspense fallback={<BlogPageLoader pageName="blog home" />}>
                    <BlogHome />
                  </Suspense>
                </BlogErrorBoundary>
              } 
            />
            
            {/* Category pages: /resources/tips, /resources/guides, /resources/news */}
            <Route 
              path=":category" 
              element={
                <BlogErrorBoundary>
                  <Suspense fallback={<BlogPageLoader pageName="category" />}>
                    <CategoryPage />
                  </Suspense>
                </BlogErrorBoundary>
              } 
            />
            
            {/* Category posts: /resources/tips/some-post */}
            <Route 
              path=":category/:slug" 
              element={
                <BlogErrorBoundary>
                  <Suspense fallback={<BlogPageLoader pageName="blog post" />}>
                    <BlogPostPage />
                  </Suspense>
                </BlogErrorBoundary>
              } 
            />
            
            {/* 404 for invalid resources routes */}
            <Route 
              path="*" 
              element={
                <Suspense fallback={<BlogPageLoader pageName="404" />}>
                  <BlogNotFound />
                </Suspense>
              } 
            />
          </Routes>
        </Suspense>
      </BlogLayout>
    </BlogErrorBoundary>
  );
};

export default BlogRoutes;