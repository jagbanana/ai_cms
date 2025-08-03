import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[HomePage]', 'Home page mounted');
    
    return () => console.log('[HomePage]', 'Home page unmounted');
  }, []);

  const handleExploreResources = () => {
    console.log('[HomePage]', 'Explore resources clicked');
    navigate('/resources');
  };

  const handleViewGuides = () => {
    console.log('[HomePage]', 'View guides clicked');
    navigate('/resources/guides');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-white">
              AI-First
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 pb-2">
                Content Management
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Build powerful, SEO-optimized websites with our modern MDX-based content management system. 
              Features image optimization, analytics, and everything you need for content-driven sites.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-10">
              <button
                onClick={handleExploreResources}
                className="group relative w-80 px-10 py-6 bg-gradient-to-br from-blue-600 to-blue-700 hover:scale-105 text-white rounded-xl text-xl font-bold transition-all transform shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 border-2 border-blue-400"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span>Explore Content</span>
                </div>
                <div className="text-sm font-normal opacity-90 mt-1">
                  Browse our resources
                </div>
              </button>
              
              <button
                onClick={handleViewGuides}
                className="group relative w-80 px-10 py-6 bg-gradient-to-br from-green-600 to-green-700 hover:scale-105 text-white rounded-xl text-xl font-bold transition-all transform shadow-xl hover:shadow-2xl hover:shadow-green-500/25 border-2 border-green-400"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>View Guides</span>
                </div>
                <div className="text-sm font-normal opacity-90 mt-1">
                  Learn how to use the CMS
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-[#1E1E22] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Powerful Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">MDX Content System</h3>
              <p className="text-slate-300">Write content in Markdown with React components. Full support for frontmatter, custom components, and rich content.</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">SEO Optimized</h3>
              <p className="text-slate-300">Built-in SEO optimization with meta tags, sitemaps, RSS feeds, and structured data for maximum search visibility.</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Image Optimization</h3>
              <p className="text-slate-300">Automatic image optimization with WebP conversion, responsive images, and lazy loading for optimal performance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Modern Technology Stack</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-blue-400 font-bold text-lg">React</span>
              </div>
              <h4 className="text-white font-medium">React 18</h4>
              <p className="text-sm text-slate-400">Modern React with TypeScript</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-green-400 font-bold text-lg">MDX</span>
              </div>
              <h4 className="text-white font-medium">MDX</h4>
              <p className="text-sm text-slate-400">Markdown with React components</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-purple-400 font-bold text-lg">Vite</span>
              </div>
              <h4 className="text-white font-medium">Vite</h4>
              <p className="text-sm text-slate-400">Lightning fast build tool</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-cyan-400 font-bold text-lg">TW</span>
              </div>
              <h4 className="text-white font-medium">Tailwind CSS</h4>
              <p className="text-sm text-slate-400">Utility-first CSS framework</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#1E1E22] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button
            onClick={handleExploreResources}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;