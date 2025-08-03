import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Layout from './components/Layout/Layout';
import { initializeGA } from './blog/utils/analytics';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));

// Lazy load blog routes
const BlogRoutes = React.lazy(() => import('./blog/routes/BlogRoutes'));
const BlogPostPage = React.lazy(() => import('./blog/pages/BlogPostPage'));

// Loading component for lazy loaded routes
const PageLoader: React.FC<{ pageName: string }> = ({ pageName }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-slate-300">Loading {pageName}...</p>
    </div>
  </div>
);

function App() {
  React.useEffect(() => {
    console.log('[App]', 'Application started');
    
    // Initialize Google Analytics
    const analyticsId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    if (analyticsId) {
      initializeGA(analyticsId, {
        respectDNT: true,
        requireConsent: false,
      });
    }
  }, []);

  return (
    <HelmetProvider>
      <div className="min-h-screen text-white overflow-x-hidden">
        <ErrorBoundary>
          <Router>
            <Layout>
              <Suspense fallback={<PageLoader pageName="page" />}>
                <Routes>
                <Route 
                  path="/" 
                  element={
                    <Suspense fallback={<PageLoader pageName="home" />}>
                      <Home />
                    </Suspense>
                  } 
                />
                
                {/* Resources routes (blog system) */}
                <Route 
                  path="/resources/*" 
                  element={
                    <Suspense fallback={<PageLoader pageName="resources" />}>
                      <BlogRoutes />
                    </Suspense>
                  } 
                />
                
                {/* Landing page routes (no category) - must come after other routes */}
                <Route 
                  path="/:slug" 
                  element={
                    <Suspense fallback={<PageLoader pageName="blog post" />}>
                      <BlogPostPage />
                    </Suspense>
                  } 
                />
              </Routes>
              </Suspense>
            </Layout>
          </Router>
        </ErrorBoundary>
      </div>
    </HelmetProvider>
  );
}

export default App;