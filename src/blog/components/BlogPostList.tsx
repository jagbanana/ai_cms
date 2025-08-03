/**
 * BlogPostList Component
 * Reusable component for displaying lists of blog posts
 * Supports multiple layouts and responsive design
 */

// React import removed - not needed for JSX in this setup
import { ProcessedBlogPost } from '../types/blog.types'
import { BlogPostCard } from './BlogPostCard'

interface BlogPostListProps {
  /** Array of blog posts to display */
  posts: ProcessedBlogPost[]
  /** Layout style for the post list */
  layout?: 'grid' | 'list'
  /** Number of columns for grid layout (default: 3) */
  columns?: number
  /** Whether to show post descriptions in cards */
  showDescription?: boolean
  /** Additional CSS classes */
  className?: string
  /** Custom empty state message */
  emptyMessage?: string
}

export function BlogPostList({
  posts,
  layout = 'grid',
  columns = 3,
  showDescription = true,
  className = '',
  emptyMessage = 'No posts found'
}: BlogPostListProps) {
  
  // Handle empty state
  if (posts.length === 0) {
    return (
      <div className={`blog-post-list-empty ${className}`}>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            {/* Empty state icon */}
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500 text-sm">
            Check back later for new content, or browse our other categories.
          </p>
        </div>
      </div>
    )
  }

  // Grid layout
  if (layout === 'grid') {
    return (
      <div className={`blog-post-list blog-post-list--grid ${className}`}>
        <div className={`grid gap-6 ${getGridColumns(columns)}`}>
          {posts.map((post) => (
            <BlogPostCard
              key={post.slug}
              post={post}
              showDescription={showDescription}
            />
          ))}
        </div>
      </div>
    )
  }

  // List layout
  return (
    <div className={`blog-post-list blog-post-list--list ${className}`}>
      <div className="space-y-6">
        {posts.map((post) => (
          <BlogPostCard
            key={post.slug}
            post={post}
            showDescription={showDescription}
            className="flex flex-col md:flex-row md:items-center"
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Get responsive grid column classes based on column count
 */
function getGridColumns(columns: number): string {
  const baseClasses = 'grid-cols-1' // Mobile: always 1 column
  const tabletClasses = 'md:grid-cols-2' // Tablet: always 2 columns
  
  // Desktop: based on columns prop
  let desktopClasses: string
  switch (columns) {
    case 1:
      desktopClasses = 'lg:grid-cols-1'
      break
    case 2:
      desktopClasses = 'lg:grid-cols-2'
      break
    case 4:
      desktopClasses = 'lg:grid-cols-4'
      break
    case 5:
      desktopClasses = 'lg:grid-cols-5'
      break
    case 6:
      desktopClasses = 'lg:grid-cols-6'
      break
    default: // 3 or any other value
      desktopClasses = 'lg:grid-cols-3'
      break
  }
  
  return `${baseClasses} ${tabletClasses} ${desktopClasses}`
}

/**
 * BlogPostList with featured post variant
 * Shows the first post as a large featured card, rest in grid
 */
interface BlogPostListWithFeaturedProps extends Omit<BlogPostListProps, 'layout'> {
  /** Whether to show a featured post at the top */
  featured?: boolean
}

export function BlogPostListWithFeatured({
  posts,
  featured = true,
  columns = 3,
  showDescription = true,
  className = '',
  emptyMessage = 'No posts found'
}: BlogPostListWithFeaturedProps) {
  
  if (posts.length === 0) {
    return (
      <BlogPostList
        posts={posts}
        emptyMessage={emptyMessage}
        className={className}
      />
    )
  }

  if (!featured || posts.length === 1) {
    return (
      <BlogPostList
        posts={posts}
        layout="grid"
        columns={columns}
        showDescription={showDescription}
        className={className}
      />
    )
  }

  const [featuredPost, ...remainingPosts] = posts

  return (
    <div className={`blog-post-list-featured ${className}`}>
      {/* Featured Post */}
      <div className="mb-12">
        <BlogPostCard
          post={featuredPost}
          showDescription={showDescription}
          className="max-w-4xl mx-auto"
        />
      </div>

      {/* Remaining Posts Grid */}
      {remainingPosts.length > 0 && (
        <BlogPostList
          posts={remainingPosts}
          layout="grid"
          columns={columns}
          showDescription={showDescription}
        />
      )}
    </div>
  )
}