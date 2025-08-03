import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CTASection } from '../CTASection';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    console.log('[Layout]', 'Route changed', { 
      pathname: location.pathname,
      search: location.search,
      hash: location.hash
    });
  }, [location]);

  const handleLogoClick = () => {
    console.log('[Layout]', 'Logo clicked', { 
      currentPath: location.pathname,
      navigatingTo: '/'
    });
    
    // Only navigate if not already on home page
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-chess-dark-secondary shadow-lg border-b border-chess-dark-tertiary">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1E1E22] rounded-lg p-1 -m-1 cursor-pointer"
              aria-label="Go to home page"
            >
              <div className="flex-shrink-0">
                {/* AI icon */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                  AI
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white tracking-tight">
                  <span>AI</span>{' '}
                  <span className="text-blue-400">CMS</span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  AI-First Content Management System
                </p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* Resources Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setResourcesDropdownOpen(!resourcesDropdownOpen)}
                  className={`flex items-center space-x-1 text-sm transition-colors ${
                    location.pathname.startsWith('/resources')
                      ? 'text-blue-400 font-medium'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span>Resources</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${
                      resourcesDropdownOpen ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {resourcesDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-chess-dark-secondary border border-chess-dark-tertiary rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/resources');
                          setResourcesDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-chess-dark-tertiary ${
                          location.pathname === '/resources'
                            ? 'text-blue-400 bg-chess-dark-tertiary'
                            : 'text-slate-300'
                        }`}
                      >
                        All Posts
                      </button>
                      <button
                        onClick={() => {
                          navigate('/resources/tips');
                          setResourcesDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-chess-dark-tertiary ${
                          location.pathname.startsWith('/resources/tips')
                            ? 'text-blue-400 bg-chess-dark-tertiary'
                            : 'text-slate-300'
                        }`}
                      >
                        Tips
                      </button>
                      <button
                        onClick={() => {
                          navigate('/resources/guides');
                          setResourcesDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-chess-dark-tertiary ${
                          location.pathname.startsWith('/resources/guides')
                            ? 'text-blue-400 bg-chess-dark-tertiary'
                            : 'text-slate-300'
                        }`}
                      >
                        Guides
                      </button>
                      <button
                        onClick={() => {
                          navigate('/resources/facts');
                          setResourcesDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-chess-dark-tertiary ${
                          location.pathname.startsWith('/resources/facts')
                            ? 'text-blue-400 bg-chess-dark-tertiary'
                            : 'text-slate-300'
                        }`}
                      >
                        Fun Facts
                      </button>
                      <button
                        onClick={() => {
                          navigate('/resources/news');
                          setResourcesDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-chess-dark-tertiary ${
                          location.pathname.startsWith('/resources/news')
                            ? 'text-blue-400 bg-chess-dark-tertiary'
                            : 'text-slate-300'
                        }`}
                      >
                        News
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* User actions - Desktop and Mobile */}
            <div className="flex items-center space-x-2">
              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-chess-dark-tertiary transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-chess-dark-secondary border-b border-chess-dark-tertiary relative z-50">
          <div className="max-w-7xl mx-auto px-2 py-3 space-y-2">
            {/* Mobile Resources Section - Top Level */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/resources');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                location.pathname.startsWith('/resources')
                  ? 'text-blue-400 bg-chess-dark-tertiary font-medium'
                  : 'text-slate-300 hover:text-slate-200 hover:bg-chess-dark-tertiary'
              }`}
            >
              Resources
            </button>
            
            {/* Mobile Resources Subcategories */}
            <div className="ml-4 space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/resources/tips');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  location.pathname.startsWith('/resources/tips')
                    ? 'text-blue-400 bg-chess-dark-tertiary font-medium'
                    : 'text-slate-300 hover:text-slate-200 hover:bg-chess-dark-tertiary'
                }`}
              >
                Tips
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/resources/guides');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  location.pathname.startsWith('/resources/guides')
                    ? 'text-blue-400 bg-chess-dark-tertiary font-medium'
                    : 'text-slate-300 hover:text-slate-200 hover:bg-chess-dark-tertiary'
                }`}
              >
                Guides
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/resources/facts');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  location.pathname.startsWith('/resources/facts')
                    ? 'text-blue-400 bg-chess-dark-tertiary font-medium'
                    : 'text-slate-300 hover:text-slate-200 hover:bg-chess-dark-tertiary'
                }`}
              >
                Fun Facts
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/resources/news');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  location.pathname.startsWith('/resources/news')
                    ? 'text-blue-400 bg-chess-dark-tertiary font-medium'
                    : 'text-slate-300 hover:text-slate-200 hover:bg-chess-dark-tertiary'
                }`}
              >
                News
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-chess-dark-primary">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-chess-dark-secondary border-t border-chess-dark-tertiary">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-white font-semibold mb-4">AI CMS</h3>
              <p className="text-sm text-slate-400">
                An AI-First Content Management System for modern websites.
              </p>
            </div>
            
            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => navigate('/resources/tips')}
                    className="text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Tips
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/resources/guides')}
                    className="text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Guides
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/resources/facts')}
                    className="text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Fun Facts
                  </button>
                </li>
              </ul>
            </div>
            
            {/* About */}
            <div>
              <h3 className="text-white font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com/jagbanana/ai_cms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Footer CTAs */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <CTASection
                ctaName="footer-primary"
                variant="footer"
              />
              <CTASection
                ctaName="footer-secondary"
                variant="footer"
              />
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-700 text-center text-sm text-slate-400">
            <p>&copy; 2024 AI CMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;