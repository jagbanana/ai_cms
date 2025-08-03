// React import removed - not needed for JSX in this setup
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, HomeIcon } from '@heroicons/react/24/outline';

export function BlogNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <MagnifyingGlassIcon className="h-16 w-16 text-gray-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the blog post or page you're looking for. 
          It might have been moved, deleted, or you may have mistyped the URL.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/blog"
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <HomeIcon className="h-5 w-5" />
            Go to Blog Home
          </Link>
          
          <Link
            to="/"
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            Return to Chess Training
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Looking for something specific? Try these popular sections:
          </p>
          
          <div className="space-y-2">
            <Link
              to="/blog/tips"
              className="block text-blue-600 hover:text-blue-800 text-sm"
            >
              Chess Tips & Strategies
            </Link>
            <Link
              to="/blog/guides"
              className="block text-blue-600 hover:text-blue-800 text-sm"
            >
              In-Depth Chess Guides
            </Link>
            <Link
              to="/blog/news"
              className="block text-blue-600 hover:text-blue-800 text-sm"
            >
              Latest News & Updates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogNotFound;