import { ProcessedBlogPost, CategoryInfo } from '../types/blog.types'
import { validateFrontmatter as validateFrontmatterCore, ProcessedFrontmatter } from './frontmatter'

/**
 * Generate a URL-friendly slug from a file path
 * Extracts the filename without extension and ensures it's URL-safe
 */
export function generateSlugFromPath(filePath: string): string {
  // Extract filename from path (e.g., "/src/blog/posts/tips/chess-strategy.mdx" -> "chess-strategy")
  const filename = filePath.split('/').pop()?.replace(/\.mdx$/, '') || ''
  
  // Ensure slug is URL-friendly
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/-+/g, '-') // Remove multiple consecutive hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

/**
 * Extract category from file path
 * Returns the category folder name or null for root-level posts
 */
export function extractCategoryFromPath(filePath: string): string | null {
  // Match pattern: /posts/[category]/filename.mdx
  const categoryMatch = filePath.match(/\/posts\/([^/]+)\/[^/]+\.mdx$/)
  
  if (categoryMatch && categoryMatch[1]) {
    const category = categoryMatch[1]
    
    // Validate that it's a known category
    const validCategories = ['tips', 'news', 'guides', 'facts']
    if (validCategories.includes(category)) {
      return category
    }
  }
  
  // Return null for root-level posts (landing pages)
  return null
}

/**
 * Generate full URL path for a blog post
 * Handles both categorized posts and landing pages
 */
export function generatePostUrl(slug: string, category: string | null): string {
  if (category) {
    return `/resources/${category}/${slug}`
  }
  
  // Landing pages go directly under root
  return `/${slug}`
}

/**
 * Sort posts by date (newest first)
 * Handles date strings in YYYY-MM-DD format
 */
export function sortPostsByDate(posts: ProcessedBlogPost[]): ProcessedBlogPost[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.frontmatter.date)
    const dateB = new Date(b.frontmatter.date)
    
    // Sort newest first
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Sort posts by title alphabetically
 */
export function sortPostsByTitle(posts: ProcessedBlogPost[]): ProcessedBlogPost[] {
  return [...posts].sort((a, b) => 
    a.frontmatter.title.localeCompare(b.frontmatter.title)
  )
}

/**
 * Filter posts by category
 */
export function filterPostsByCategory(
  posts: ProcessedBlogPost[], 
  category: string
): ProcessedBlogPost[] {
  return posts.filter(post => post.category === category)
}

/**
 * Get posts without a category (landing pages)
 */
export function getLandingPagePosts(posts: ProcessedBlogPost[]): ProcessedBlogPost[] {
  return posts.filter(post => !post.category)
}

/**
 * Generate category information from processed posts
 */
export function generateCategoryInfo(posts: ProcessedBlogPost[]): CategoryInfo[] {
  const categoryMap = new Map<string, number>()
  let uncategorizedCount = 0
  
  // Count posts per category
  posts.forEach(post => {
    if (post.category) {
      categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1)
    } else {
      uncategorizedCount++
    }
  })
  
  // Create category info objects
  const categories = Array.from(categoryMap.entries()).map(([name, postCount]) => ({
    name,
    displayName: getCategoryDisplayName(name),
    description: getCategoryDescription(name),
    postCount,
    url: `/resources/${name}`
  }))
  
  // Add "other" category for uncategorized posts if any exist
  if (uncategorizedCount > 0) {
    categories.push({
      name: 'other',
      displayName: 'Other',
      description: 'Features, updates, and other posts',
      postCount: uncategorizedCount,
      url: '/resources?category=other'
    })
  }
  
  return categories
}

/**
 * Get display name for a category
 */
function getCategoryDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    tips: 'Chess Tips',
    news: 'News & Updates',
    guides: 'Guides & Tutorials',
    facts: 'Fun Facts'
  }
  
  return displayNames[category] || category
}

/**
 * Get description for a category
 */
function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    tips: 'Quick chess strategies, tactics, and tips to improve your game',
    news: 'Latest updates, features, and announcements from Chess Trainer',
    guides: 'In-depth tutorials and comprehensive how-to guides',
    facts: 'Interesting chess trivia and fascinating facts about the game'
  }
  
  return descriptions[category] || `Posts in the ${category} category`
}

/**
 * Find related posts based on category and keywords
 */
export function getRelatedPosts(
  currentPost: ProcessedBlogPost, 
  allPosts: ProcessedBlogPost[], 
  limit: number = 3
): ProcessedBlogPost[] {
  // Exclude the current post
  const otherPosts = allPosts.filter(post => post.slug !== currentPost.slug)
  
  // Score posts by relevance
  const scoredPosts = otherPosts.map(post => ({
    post,
    score: calculateRelevanceScore(currentPost, post)
  }))
  
  // Sort by score (highest first) and take the top results
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post)
}

/**
 * Calculate relevance score between two posts
 */
function calculateRelevanceScore(
  currentPost: ProcessedBlogPost, 
  candidatePost: ProcessedBlogPost
): number {
  let score = 0
  
  // Same category gets high score
  if (currentPost.category === candidatePost.category) {
    score += 10
  }
  
  // Shared keywords
  const currentKeywords = currentPost.frontmatter.keywords.map(k => k.toLowerCase())
  const candidateKeywords = candidatePost.frontmatter.keywords.map(k => k.toLowerCase())
  
  const sharedKeywords = currentKeywords.filter(keyword => 
    candidateKeywords.includes(keyword)
  )
  
  score += sharedKeywords.length * 2
  
  // Recent posts get slight bonus
  const daysDiff = Math.abs(
    new Date(currentPost.frontmatter.date).getTime() - 
    new Date(candidatePost.frontmatter.date).getTime()
  ) / (1000 * 60 * 60 * 24)
  
  if (daysDiff < 30) {
    score += 1
  }
  
  return score
}

/**
 * Search posts by title, description, and keywords
 */
export function searchPosts(
  posts: ProcessedBlogPost[], 
  query: string
): ProcessedBlogPost[] {
  if (!query.trim()) {
    return posts
  }
  
  const searchTerms = query.toLowerCase().split(/\s+/)
  
  return posts.filter(post => {
    const searchableText = [
      post.frontmatter.title,
      post.frontmatter.description,
      ...post.frontmatter.keywords
    ].join(' ').toLowerCase()
    
    return searchTerms.every(term => searchableText.includes(term))
  })
}

/**
 * Get posts for a specific page (pagination)
 */
export function getPaginatedPosts(
  posts: ProcessedBlogPost[], 
  page: number, 
  postsPerPage: number
): ProcessedBlogPost[] {
  const startIndex = (page - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  
  return posts.slice(startIndex, endIndex)
}

/**
 * Calculate total pages for pagination
 */
export function getTotalPages(totalPosts: number, postsPerPage: number): number {
  return Math.ceil(totalPosts / postsPerPage)
}

/**
 * Validate blog post frontmatter using the comprehensive frontmatter parser
 */
export function validateFrontmatter(frontmatter: any, filePath?: string): ProcessedFrontmatter {
  return validateFrontmatterCore(frontmatter, filePath)
}