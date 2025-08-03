import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { ProcessedBlogPost } from '../types/blog.types';
import { getBlogPostBySlug } from '../utils/post-discovery-runtime';
import BlogPostHeader from '../components/BlogPostHeader';
import TableOfContents from '../components/TableOfContents';
import RelatedPosts from '../components/RelatedPosts';
import { ShareButtons } from '../components/ShareButtons';
import { BlogSEO } from '../components/BlogSEO';
import { BlogPostProvider } from '../contexts/BlogPostContext';
import { BlogNotFound } from './BlogNotFound';
import { useAnalytics } from '../utils/analytics';
import logger from '../../utils/logger';
import { mdxComponents } from '../components/MDXComponents';
import { CTASection } from '../../components/CTASection';

// Helper function to generate IDs from text content
const generateId = (children: any): string => {
  if (typeof children === 'string') {
    return children
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  return '';
};

// No need to redefine MDX components - we're using the imported ones

interface BlogPostPageProps {}

const BlogPostPage: React.FC<BlogPostPageProps> = () => {
  const { category, slug } = useParams<{ category?: string; slug: string }>();
  const [post, setPost] = useState<ProcessedBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollTrackedRef = useRef<Set<number>>(new Set());
  const { trackPageView, trackResourceView, trackResourceScroll, trackCTAClick } = useAnalytics();

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        logger.warn('BlogPostPage', 'No slug provided');
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        logger.info('BlogPostPage', 'Loading blog post', { slug, category });
        
        const foundPost = await getBlogPostBySlug(slug);
        
        if (foundPost) {
          // Verify the category matches the URL (if category is provided)
          if (category && foundPost.category !== category) {
            logger.warn('BlogPostPage', 'Category mismatch', { 
              expectedCategory: category, 
              actualCategory: foundPost.category,
              slug 
            });
            setNotFound(true);
          } else {
            setPost(foundPost);
            logger.info('BlogPostPage', 'Blog post loaded successfully', { 
              title: foundPost.frontmatter.title,
              category: foundPost.category,
              slug 
            });
          }
        } else {
          logger.warn('BlogPostPage', 'Blog post not found', { slug, category });
          setNotFound(true);
        }
      } catch (err) {
        logger.error('BlogPostPage', 'Error loading blog post', { error: err, slug, category });
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, category]);

  // Scroll to top when navigating to a new blog post
  useEffect(() => {
    // Scroll to the very top of the page
    window.scrollTo(0, 0);
    // Also reset scroll tracking for the new post
    scrollTrackedRef.current.clear();
  }, [slug, category]);

  // Track page view when post loads
  useEffect(() => {
    if (post) {
      const title = post.frontmatter.title;
      const path = `${post.category ? `/${post.category}` : ''}/${post.slug}`;
      
      // Track page view
      trackPageView(path, title);
      
      // Track resource view with metadata
      trackResourceView(
        title,
        post.category || 'landing',
        post.readingTime || 5
      );
    }
  }, [post, trackPageView, trackResourceView]);

  // Track scroll progress
  useEffect(() => {
    if (!post) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      const milestones = [25, 50, 75, 100];
      const currentMilestone = milestones.find(
        milestone => scrollPercent >= milestone && !scrollTrackedRef.current.has(milestone)
      );
      
      if (currentMilestone) {
        scrollTrackedRef.current.add(currentMilestone);
        trackResourceScroll(post.frontmatter.title, currentMilestone);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post, trackResourceScroll]);

  if (loading) {
    return (
      <div className="min-h-screen bg-chess-dark-primary text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-chess-dark-secondary rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-chess-dark-secondary rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-chess-dark-secondary rounded mb-8 w-1/3"></div>
            <div className="space-y-4">
              <div className="h-4 bg-chess-dark-secondary rounded w-full"></div>
              <div className="h-4 bg-chess-dark-secondary rounded w-5/6"></div>
              <div className="h-4 bg-chess-dark-secondary rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chess-dark-primary text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 text-red-400">⚠️</div>
          <h1 className="text-2xl text-red-400 mb-4">Error Loading Post</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return <BlogNotFound />;
  }

  const PostComponent = post.component;

  // Generate the full URL for sharing
  const shareUrl = `${window.location.origin}${post.category ? `/${post.category}` : ''}/${post.slug}`;
  const currentPath = `${post.category ? `/${post.category}` : ''}/${post.slug}`;

  return (
    <BlogPostProvider currentPost={post}>
      <BlogSEO
        title={post.frontmatter.title}
        description={post.frontmatter.description}
        image={post.frontmatter.image || undefined}
        canonical={`${import.meta.env.VITE_SITE_URL || 'https://ai-cms.dev'}${post.url}`}
        type="article"
        post={post}
        path={currentPath}
      />
      <div className="min-h-screen bg-chess-dark-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
          {/* Header takes full width */}
          <BlogPostHeader post={post} />
        
        {/* Share buttons - mobile: below header, desktop: floating left */}
        <div className="block lg:hidden mb-6">
          <ShareButtons 
            title={post.frontmatter.title}
            description={post.frontmatter.description}
            url={shareUrl}
            className="flex-row"
          />
        </div>
        
        {/* Desktop floating share buttons */}
        <div className="hidden lg:block fixed left-4 top-1/2 transform -translate-y-1/2 z-10">
          <ShareButtons 
            title={post.frontmatter.title}
            description={post.frontmatter.description}
            url={shareUrl}
          />
        </div>
        
        {/* Inline TOC - appears below header for all screen sizes */}
        <TableOfContents className="mb-8" />
        
        {/* Main content - now takes full width */}
        <article className="max-w-none">
          <div className="max-w-none">
            <MDXProvider components={mdxComponents}>
              <Suspense 
                fallback={
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-chess-dark-secondary rounded w-full"></div>
                    <div className="h-4 bg-chess-dark-secondary rounded w-5/6"></div>
                    <div className="h-4 bg-chess-dark-secondary rounded w-4/5"></div>
                  </div>
                }
              >
                <PostComponent />
              </Suspense>
            </MDXProvider>
          </div>
        </article>
        
        {/* Call to Action */}
        <CTASection
          ctaName="blog-post"
          className="mt-12"
          variant="default"
          onButtonClick={(ctaName, buttonUrl) => {
            trackCTAClick('blog-post-cta', `blog-post-${post.slug}`);
          }}
        />
        
        {/* Related Posts */}
        <RelatedPosts currentPost={post} limit={3} className="mt-12" />
        </div>
      </div>
    </BlogPostProvider>
  );
};

export default BlogPostPage;