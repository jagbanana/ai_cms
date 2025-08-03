/**
 * BlogPostCard Component
 * Individual post card for use in post lists and grids
 */

// React import removed - not needed for JSX in this setup
import { Link } from 'react-router-dom'
import { ProcessedBlogPost } from '../types/blog.types'
import { formatDate } from '../utils/date-helpers'
import { formatReadingTime } from '../utils/reading-time'

interface BlogPostCardProps {
  post: ProcessedBlogPost
  showDescription?: boolean
  className?: string
}

export function BlogPostCard({ 
  post, 
  showDescription = true,
  className = ''
}: BlogPostCardProps) {
  const { frontmatter, url, readingTime } = post
  
  return (
    <Link to={url} className="block group">
      <article className={`blog-post-card bg-chess-dark-secondary rounded-lg shadow-sm border border-chess-dark-tertiary hover:shadow-lg hover:scale-105 transition-all duration-200 overflow-hidden h-full flex flex-col ${className}`}>
        {/* Hero Image or Placeholder */}
        <div className="aspect-video overflow-hidden bg-chess-dark-tertiary flex-shrink-0">
          {frontmatter.image ? (
            <img
              src={frontmatter.image}
              srcSet={`${frontmatter.image}?w=400 400w, ${frontmatter.image}?w=600 600w, ${frontmatter.image}?w=800 800w`}
              sizes="(max-width: 768px) 400px, (max-width: 1024px) 600px, 800px"
              alt={frontmatter.title}
              width={400}
              height={225}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              decoding="async"
              style={{ aspectRatio: '16/9' }}
            />
          ) : (
            <div className="w-full h-full bg-chess-dark-primary flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
              <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
          {/* Category Badge */}
          {frontmatter.category && (
            <div className="mb-3">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryStyles(frontmatter.category)}`}>
                {getCategoryDisplay(frontmatter.category)}
              </span>
            </div>
          )}
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">
            {frontmatter.title}
          </h3>
          
          {/* Description */}
          {showDescription && (
            <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
              {frontmatter.description}
            </p>
          )}
          
          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-slate-400 mt-auto">
            <div className="flex items-center space-x-4">
              <span>{formatDate(frontmatter.date)}</span>
              <span>•</span>
              <span>{formatReadingTime(readingTime)}</span>
            </div>
            
            <span className="text-slate-500">
              {frontmatter.author}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

/**
 * Get Tailwind CSS classes for category badges
 */
function getCategoryStyles(category: string): string {
  switch (category) {
    case 'tips':
      return 'bg-blue-900/50 text-blue-300 border border-blue-700/30'
    case 'guides':
      return 'bg-purple-900/50 text-purple-300 border border-purple-700/30'
    case 'news':
      return 'bg-green-900/50 text-green-300 border border-green-700/30'
    default:
      return 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
  }
}

/**
 * Get display name for categories
 */
function getCategoryDisplay(category: string): string {
  switch (category) {
    case 'tips':
      return 'Tips'
    case 'guides':
      return 'Guides'
    case 'news':
      return 'News'
    default:
      return category
  }
}