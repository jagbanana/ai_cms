/**
 * RelatedPosts Component
 * Shows 3-4 related posts based on category, keywords, and recency
 */

import { useState, useEffect } from 'react';
import { ProcessedBlogPost } from '../types/blog.types';
import { BlogPostCard } from './BlogPostCard';
import { getRelatedPosts } from '../utils/related-posts';
import { getAllBlogPosts } from '../utils/post-discovery-runtime';

interface RelatedPostsProps {
  /** Current post to find related posts for */
  currentPost: ProcessedBlogPost;
  /** Number of related posts to show (default: 3) */
  limit?: number;
  /** Custom CSS classes */
  className?: string;
}

export function RelatedPosts({ 
  currentPost, 
  limit = 3, 
  className = '' 
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<ProcessedBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRelatedPosts() {
      try {
        setLoading(true);
        setError(null);
        
        // Get all blog posts
        const { posts } = await getAllBlogPosts();
        
        // Find related posts
        const related = await getRelatedPosts(currentPost, posts, { limit });
        
        setRelatedPosts(related);
      } catch (err) {
        console.error('Error loading related posts:', err);
        setError('Failed to load related posts');
      } finally {
        setLoading(false);
      }
    }

    loadRelatedPosts();
  }, [currentPost.slug, limit]);

  // Don't render if no related posts or error
  if (error || (!loading && relatedPosts.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <section className={`related-posts ${className}`}>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
          Keep Learning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, index) => (
            <div 
              key={index} 
              className="bg-chess-dark-secondary rounded-lg p-6 animate-pulse"
            >
              <div className="aspect-video bg-chess-dark-tertiary rounded mb-4"></div>
              <div className="h-4 bg-chess-dark-tertiary rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-chess-dark-tertiary rounded mb-4 w-1/2"></div>
              <div className="h-3 bg-chess-dark-tertiary rounded w-full"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`related-posts ${className}`}>
      <div className="border-t border-chess-dark-tertiary pt-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Keep Learning
        </h2>
        <p className="text-slate-400 mb-8">
          Continue your content journey with these related resources
        </p>
        
        <div className={`grid gap-6 ${getGridClasses(relatedPosts.length)}`}>
          {relatedPosts.map((post) => (
            <BlogPostCard
              key={post.slug}
              post={post}
              showDescription={true}
              className="h-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Get appropriate grid classes based on number of posts
 */
function getGridClasses(postCount: number): string {
  switch (postCount) {
    case 1:
      return 'grid-cols-1 max-w-md mx-auto';
    case 2:
      return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
    case 3:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    case 4:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    default:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  }
}

export default RelatedPosts;