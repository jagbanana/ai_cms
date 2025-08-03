import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProcessedBlogPost, CategoryInfo } from '../types/blog.types';
import { 
  getFeaturedBlogPost, 
  getAllBlogPosts 
} from '../utils/post-discovery-runtime';
import CategoryFilter from '../components/CategoryFilter';
import { Pagination } from '../components/Pagination';
import { paginateBlogPosts, parsePageFromUrl, generatePaginationParams } from '../utils/pagination';
import { BlogSearch } from '../components/BlogSearch';
import { searchPosts } from '../utils/search';
import { BlogSEO } from '../components/BlogSEO';
import { PostListSkeleton } from '../components/skeletons/PostListSkeleton';
import { BlogPostCard } from '../components/BlogPostCard';
import logger from '../../utils/logger';
import BlogAnalytics from '../utils/blog-analytics';

interface BlogHomeProps {}

const BlogHome: React.FC<BlogHomeProps> = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [featuredPost, setFeaturedPost] = useState<ProcessedBlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<ProcessedBlogPost[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // Get active category and page from URL params
  const activeCategory = searchParams.get('category') || null;
  const currentPage = parsePageFromUrl(searchParams.get('page'));

  // Filter posts based on active category and search query
  const filteredPosts = React.useMemo(() => {
    let posts = allPosts;
    
    // Apply category filter
    if (activeCategory) {
      if (activeCategory === 'other') {
        // Show posts with no category
        posts = posts.filter(post => post.category === null);
      } else {
        posts = posts.filter(post => post.category === activeCategory);
      }
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      posts = searchPosts(posts, searchQuery);
    }
    
    return posts;
  }, [allPosts, activeCategory, searchQuery]);

  // Paginate the filtered posts
  const paginationResult = React.useMemo(() => {
    return paginateBlogPosts(filteredPosts, currentPage, 12);
  }, [filteredPosts, currentPage]);

  // Handle category change
  const handleCategoryChange = (category: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    // Reset to page 1 when changing category
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Update URL with search query and reset to page 1
    const newParams = new URLSearchParams(searchParams);
    if (query.trim()) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const newParams = generatePaginationParams(searchParams, newPage);
    setSearchParams(newParams);
  };

  useEffect(() => {
    const loadBlogData = async () => {
      const startTime = Date.now();
      try {
        setLoading(true);
        logger.info('BlogHome', 'Loading blog data', { activeCategory });
        
        // Load all blog data
        const [featured, allData] = await Promise.all([
          getFeaturedBlogPost(),
          getAllBlogPosts()
        ]);

        setFeaturedPost(featured);
        setAllPosts(allData.posts);
        setCategories(allData.categories);
        
        logger.info('BlogHome', 'Blog data loaded successfully', {
          featuredPost: !!featured,
          totalPosts: allData.posts.length,
          categoriesCount: allData.categories.length,
          activeCategory
        });
        
        // Track successful page load
        BlogAnalytics.trackPageLoad('blog_home', 'home', Date.now() - startTime);
      } catch (err) {
        BlogAnalytics.trackError({
          error_type: 'data_load_error',
          error_message: 'Failed to load blog data',
          component: 'BlogHome',
          page_path: '/blog'
        });
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chess-dark-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <PostListSkeleton count={9} showFeatured={true} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chess-dark-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-4xl mb-4 text-red-400">⚠️</div>
            <h1 className="text-2xl text-red-400 mb-4">Error Loading Blog</h1>
            <p className="text-slate-300 mb-6">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mr-4"
              >
                Try Again
              </button>
              <Link
                to="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Return to Chess Training
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <BlogSEO
        title="Chess Training Resources | Tips, Guides & News"
        description="Learn chess with our comprehensive training resources. Find expert tips, in-depth guides, and latest news to improve your chess skills."
        canonical="https://chesstrainer.org/blog"
        type="blog"
        path="/blog"
      />
      <div className="min-h-screen bg-chess-dark-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Chess Resources
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Tips, strategies, and insights to improve your chess game. 
              Learn from expert analysis and proven techniques.
            </p>
          </header>

        {/* Featured Post Hero */}
        {featuredPost && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Post</h2>
            <FeaturedPostCard post={featuredPost} />
          </section>
        )}

        {/* Search */}
        <section className="mb-8">
          <BlogSearch
            onSearchChange={handleSearchChange}
            placeholder="Search resources..."
            className="max-w-md mx-auto"
          />
        </section>

        {/* Category Filter */}
        <section className="mb-8">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            totalPosts={allPosts.length}
          />
        </section>

        {/* Posts Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {searchQuery 
                ? `Search Results`
                : activeCategory 
                ? `${categories.find(c => c.name === activeCategory)?.displayName || 'Posts'}`
                : 'All Posts'
              }
            </h2>
            <div className="text-sm text-slate-400">
              {paginationResult.totalItems} {paginationResult.totalItems === 1 ? 'post' : 'posts'}
              {paginationResult.totalPages > 1 && (
                <span className="ml-2">
                  (Page {paginationResult.currentPage} of {paginationResult.totalPages})
                </span>
              )}
            </div>
          </div>
          
          {paginationResult.items.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-4xl mb-4 text-slate-500">📭</div>
              <p className="text-lg text-slate-400 mb-2">
                {searchQuery 
                  ? `No resources found for "${searchQuery}"`
                  : activeCategory 
                  ? 'No posts found in this category'
                  : 'No posts found'
                }
              </p>
              <p className="text-sm text-slate-500">
                {searchQuery 
                  ? 'Try a different search term or browse all posts'
                  : 'Try selecting a different category or check back later'
                }
              </p>
            </div>
          )}

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
        </section>

        {/* Categories - Only show when no filter is active */}
        {!activeCategory && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard key={category.name} category={category} />
              ))}
            </div>
          </section>
        )}
        </div>
      </div>
    </>
  );
};

// Featured Post Card Component
const FeaturedPostCard: React.FC<{ post: ProcessedBlogPost }> = ({ post }) => {
  return (
    <Link to={post.url} className="block group">
      <div className="bg-chess-dark-secondary rounded-lg border border-chess-dark-tertiary overflow-hidden hover:border-blue-500/50 transition-all duration-200">
        {/* Image placeholder or actual image */}
        <div className="w-full bg-gradient-to-br from-blue-600 to-purple-600">
          {post.frontmatter.image ? (
            <img 
              src={post.frontmatter.image} 
              alt={post.frontmatter.title}
              className="w-full h-auto object-contain"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-center text-white/80">
              <div>
                <div className="text-4xl mb-2">♟</div>
                <div className="text-sm">Featured Post</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-8">
          {post.category && (
            <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-full mb-4">
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </span>
          )}
          
          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
            {post.frontmatter.title}
          </h3>
          
          <p className="text-slate-300 mb-4 line-clamp-3">
            {post.frontmatter.description}
          </p>
          
          <div className="flex items-center text-sm text-slate-400">
            <span>{post.frontmatter.author}</span>
            <span className="mx-2">•</span>
            <span>{post.readingTime} min read</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.frontmatter.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};


// Category Card Component
const CategoryCard: React.FC<{ category: CategoryInfo }> = ({ category }) => {
  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'tips': return '💡';
      case 'guides': return '📚';
      case 'news': return '📰';
      case 'other': return '📄';
      default: return '📝';
    }
  };

  return (
    <Link to={category.url} className="block group">
      <div className="bg-chess-dark-secondary rounded-lg border border-chess-dark-tertiary p-6 text-center hover:border-blue-500/50 transition-all duration-200">
        <div className="text-3xl mb-3">{getCategoryIcon(category.name)}</div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
          {category.displayName}
        </h3>
        <p className="text-slate-300 text-sm mb-3 line-clamp-2">
          {category.description}
        </p>
        <div className="text-blue-400 text-sm font-medium">
          {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
        </div>
      </div>
    </Link>
  );
};


export default BlogHome;