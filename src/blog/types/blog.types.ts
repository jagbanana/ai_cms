import { ComponentType } from 'react'
import { ProcessedFrontmatter } from '../utils/frontmatter'

/**
 * Frontmatter interface for blog posts
 * Defines the metadata that must be included in each MDX file
 */
export interface BlogFrontmatter {
  /** Post title for display and SEO */
  title: string
  /** Meta description for SEO (150-160 characters recommended) */
  description: string
  /** Publication date in YYYY-MM-DD format */
  date: string
  /** URL-friendly slug for the post */
  slug: string
  /** Category for organization - 'tips', 'news', 'guides', 'facts', or null for landing pages */
  category: 'tips' | 'news' | 'guides' | 'facts' | null
  /** Author name or team */
  author: string
  /** Hero image path (optional) */
  image: string | null
  /** Keywords for SEO */
  keywords: string[]
  /** Canonical URL for SEO */
  canonical?: string
}

/**
 * Raw blog post module as imported by Vite
 * Represents the structure of imported MDX files
 */
export interface BlogPostModule {
  /** React component for the MDX content */
  default: ComponentType
  /** Parsed frontmatter data */
  frontmatter: BlogFrontmatter
}

/**
 * Processed blog post with computed metadata
 * This is what the blog system uses at runtime
 */
export interface ProcessedBlogPost {
  /** All frontmatter data (validated and processed) */
  frontmatter: ProcessedFrontmatter
  /** URL-friendly slug extracted from filename or frontmatter */
  slug: string
  /** Post category extracted from file path */
  category: string | null
  /** Full URL path for the post */
  url: string
  /** React component for rendering the post content */
  component: ComponentType
  /** Estimated reading time in minutes */
  readingTime: number
  /** Raw content for search indexing (if needed) */
  rawContent?: string
}

/**
 * Blog category information
 */
export interface CategoryInfo {
  /** Category name (tips, news, guides) */
  name: string
  /** Display name for UI */
  displayName: string
  /** Category description */
  description: string
  /** Number of posts in this category */
  postCount: number
  /** URL path for the category page */
  url: string
}

/**
 * Blog post discovery result
 * Contains all processed posts and category information
 */
export interface BlogDiscoveryResult {
  /** All processed blog posts */
  posts: ProcessedBlogPost[]
  /** Category information */
  categories: CategoryInfo[]
  /** Total number of posts */
  totalPosts: number
  /** Last updated timestamp */
  lastUpdated: Date
}

/**
 * Blog navigation item
 */
export interface BlogNavItem {
  /** Display text */
  label: string
  /** URL path */
  href: string
  /** Whether this item is currently active */
  active?: boolean
  /** Number of posts (for category nav) */
  count?: number
}

/**
 * Blog pagination info
 */
export interface BlogPagination {
  /** Current page number (1-based) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Number of posts per page */
  postsPerPage: number
  /** Total number of posts */
  totalPosts: number
  /** Whether there's a previous page */
  hasPrevious: boolean
  /** Whether there's a next page */
  hasNext: boolean
}

/**
 * Blog SEO data
 */
export interface BlogSEOData {
  /** Page title */
  title: string
  /** Meta description */
  description: string
  /** Canonical URL */
  canonical: string
  /** Open Graph image */
  image?: string
  /** Article-specific metadata */
  article?: {
    publishedTime: string
    modifiedTime?: string
    author: string
    tags: string[]
  }
  /** JSON-LD structured data */
  structuredData?: Record<string, unknown>
}