import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getCategoryInfo, isValidCategory } from '../data/categories';
import { getBlogPostsByCategory } from '../utils/post-discovery-runtime';
import { ProcessedBlogPost } from '../types/blog.types';
import { Pagination } from '../components/Pagination';
import { paginateBlogPosts, parsePageFromUrl, generatePaginationParams } from '../utils/pagination';
import { BlogSEO } from '../components/BlogSEO';
import { PostListSkeleton } from '../components/skeletons/PostListSkeleton';
import { BlogPostCard } from '../components/BlogPostCard';
import logger from '../../utils/logger';

interface CategoryPageProps {}

const CategoryPage: React.FC<CategoryPageProps> = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<ProcessedBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current page from URL params
  const currentPage = parsePageFromUrl(searchParams.get('page'));
  const postsPerPage = 12;

  // Check if category is valid
  if (!category || !isValidCategory(category)) {
    return (
      <div className="min-h-screen bg-chess-dark-primary text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Category Not Found</h1>
          <p className="text-lg text-slate-300 mb-6">
            The category "{category}" doesn't exist.
          </p>
          <div className="space-y-4">
            <Link 
              to="/resources" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Browse All Resources
            </Link>
            <div className="text-sm text-slate-400">
              Available categories: tips, guides, news
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(category);
  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-chess-dark-primary text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Category Not Found</h1>
          <p className="text-lg text-slate-300 mb-6">
            Unable to load category information.
          </p>
          <Link 
            to="/resources" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Browse All Resources
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        logger.info('CategoryPage', 'Loading category posts', { category });
        const categoryPosts = await getBlogPostsByCategory(category);
        setPosts(categoryPosts);
        logger.info('CategoryPage', 'Category posts loaded successfully', { 
          category, 
          postsCount: categoryPosts.length 
        });
      } catch (err) {
        logger.error('CategoryPage', 'Error loading category posts', { error: err, category });
        setError('Failed to load posts for this category');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [category]);

  // Pagination logic
  const paginationResult = React.useMemo(() => {
    return paginateBlogPosts(posts, currentPage, postsPerPage);
  }, [posts, currentPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const newParams = generatePaginationParams(searchParams, newPage);
    setSearchParams(newParams);
  };


  return (
    <>
      <BlogSEO
        title={`${categoryInfo.name} | AI CMS Resources`}
        description={categoryInfo.description}
        canonical={`${import.meta.env.VITE_SITE_URL || 'https://ai-cms.dev'}/resources/${category}`}
        type="blog"
        path={`/resources/${category}`}
      />
      <div className="min-h-screen bg-chess-dark-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <header className="mb-12">
            <nav className="mb-4">
              <span className="text-sm text-slate-400">
                <Link to="/resources" className="hover:text-blue-400 transition-colors">Resources</Link>
                {' > '}
                <span className="text-blue-400">{categoryInfo.name}</span>
              </span>
            </nav>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              {categoryInfo.name}
            </h1>
            <p className="text-lg text-slate-300 mb-4">
              {categoryInfo.description}
            </p>
          
          <div className="text-sm text-slate-400">
            {loading ? (
              'Loading posts...'
            ) : (
              <>
                {paginationResult.totalItems} {paginationResult.totalItems === 1 ? 'post' : 'posts'} in this category
                {paginationResult.totalPages > 1 && (
                  <span className="ml-2">
                    (Page {paginationResult.currentPage} of {paginationResult.totalPages})
                  </span>
                )}
              </>
            )}
          </div>
        </header>

        {loading ? (
          <PostListSkeleton count={6} showFeatured={false} />
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-chess-dark-secondary rounded-lg p-8 border border-chess-dark-tertiary">
              <div className="text-4xl mb-4 text-red-400">⚠️</div>
              <h2 className="text-xl font-semibold text-red-400 mb-4">
                Error Loading Posts
              </h2>
              <p className="text-slate-300 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <Link 
                  to="/blog" 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Back to Blog
                </Link>
              </div>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-chess-dark-secondary rounded-lg p-8 border border-chess-dark-tertiary">
              <h2 className="text-xl font-semibold text-white mb-4">
                No posts yet in {categoryInfo.name}
              </h2>
              <p className="text-slate-300 mb-6">
                We're working on creating great content for this category. Check back soon!
              </p>
              <Link 
                to="/resources" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Browse All Resources
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {paginationResult.items.map((post, index) => (
                <div
                  key={post.slug}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <BlogPostCard post={post} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {paginationResult.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={paginationResult.currentPage}
                  totalPages={paginationResult.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;