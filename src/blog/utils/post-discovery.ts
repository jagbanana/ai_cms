import { 
  BlogPostModule, 
  ProcessedBlogPost, 
  BlogDiscoveryResult
} from '../types/blog.types'
import { 
  generateSlugFromPath, 
  extractCategoryFromPath, 
  generatePostUrl,
  generateCategoryInfo,
  sortPostsByDate,
  validateFrontmatter
} from './mdx-helpers'
import { 
  estimateReadingTimeFromFrontmatter,
  formatReadingTime,
  calculateFullBlogReadingTime
} from './reading-time'

/**
 * Discover and process all blog posts using Vite's import.meta.glob
 * This function runs at build time to collect all MDX files and their metadata
 */
export async function discoverBlogPosts(): Promise<BlogDiscoveryResult> {
  try {
    console.log('🔍 Starting MDX discovery...')
    
    // Use Vite's glob import to find all MDX files in the posts directory
    // The eager: true option loads all modules immediately
    let postModules = import.meta.glob<BlogPostModule>(
      '../posts/**/*.mdx',
      { eager: true }
    )
    
    console.log('📁 Found modules via glob:', Object.keys(postModules).length)
    
    // If glob returns empty, try using the manual registry
    if (Object.keys(postModules).length === 0) {
      console.log('📚 Glob returned empty, using manual registry...')
      const { getRegisteredPosts } = await import('./mdx-registry')
      postModules = getRegisteredPosts() as any
      console.log('📚 Loaded', Object.keys(postModules).length, 'posts from registry')
    }
    
    console.log('📁 Total modules found:', Object.keys(postModules).length)
    console.log('📦 First module structure:', Object.keys(postModules)[0] ? postModules[Object.keys(postModules)[0]] : 'none')

    // Also try to get raw content for better reading time calculation
    // This will work in development and build environments differently
    const rawContentModules = import.meta.glob(
      '../posts/**/*.mdx',
      { eager: true, query: '?raw', import: 'default' }
    )

    const processedPosts: ProcessedBlogPost[] = []
    const errors: Array<{ path: string; error: string }> = []

    // Process each discovered post
    for (const [filePath, module] of Object.entries(postModules)) {
      try {
        // Get raw content if available
        const rawContent = rawContentModules[filePath] as string | undefined
        const processedPost = await processPost(filePath, module, rawContent)
        if (processedPost) {
          processedPosts.push(processedPost)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push({ path: filePath, error: errorMessage })
        console.error(`Error processing post ${filePath}:`, error)
      }
    }

    // Log any errors but continue with valid posts
    if (errors.length > 0) {
      console.warn(`Found ${errors.length} posts with errors:`, errors)
    }

    // Generate category information
    const categories = generateCategoryInfo(processedPosts)

    // Sort posts by date (newest first)
    const sortedPosts = sortPostsByDate(processedPosts)

    return {
      posts: sortedPosts,
      categories,
      totalPosts: sortedPosts.length,
      lastUpdated: new Date()
    }
  } catch (error) {
    console.error('Failed to discover blog posts:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    console.log('🔄 Falling back to runtime discovery...')
    
    // Fallback to runtime discovery
    try {
      const { discoverBlogPosts: runtimeDiscovery } = await import('./post-discovery-runtime')
      const result = await runtimeDiscovery()
      console.log('✅ Runtime discovery succeeded with', result.totalPosts, 'posts')
      return result
    } catch (fallbackError) {
      console.error('Fallback discovery also failed:', fallbackError)
      
      // Return empty result rather than throwing
      return {
        posts: [],
        categories: [],
        totalPosts: 0,
        lastUpdated: new Date()
      }
    }
  }
}

/**
 * Process a single blog post module into a ProcessedBlogPost
 */
async function processPost(
  filePath: string, 
  module: BlogPostModule,
  rawContent?: string
): Promise<ProcessedBlogPost | null> {
  // Validate that the module has the expected structure
  if (!module.default || !module.frontmatter) {
    throw new Error(`Invalid MDX module structure in ${filePath}`)
  }

  const { frontmatter } = module

  // Validate frontmatter
  if (!validateFrontmatter(frontmatter)) {
    throw new Error(`Invalid frontmatter in ${filePath}`)
  }

  // Extract metadata from file path
  const slugFromPath = generateSlugFromPath(filePath)
  const category = extractCategoryFromPath(filePath)

  // Use slug from frontmatter or fall back to generated slug
  const slug = frontmatter.slug || slugFromPath

  // Generate full URL
  const url = generatePostUrl(slug, category)

  // Calculate reading time - use raw content if available, otherwise estimate from frontmatter
  const estimatedReadingTime = rawContent 
    ? calculateFullBlogReadingTime(rawContent, frontmatter)
    : estimateReadingTimeFromFrontmatter(frontmatter)

  return {
    frontmatter,
    slug,
    category,
    url,
    component: module.default,
    readingTime: estimatedReadingTime,
    // rawContent could be added here if we need full-text search
  }
}

/**
 * Get reading time text for a blog post
 * Formats the reading time as human-readable text
 */
export function getReadingTimeText(minutes: number): string {
  return formatReadingTime(minutes)
}

/**
 * Get all blog posts (cached)
 * This can be called from components to access the post data
 */
let cachedBlogData: BlogDiscoveryResult | null = null

export async function getAllBlogPosts(): Promise<BlogDiscoveryResult> {
  // In development, always refresh to pick up new posts
  if (import.meta.env?.DEV && cachedBlogData) {
    console.log('🔄 Development mode: refreshing blog cache')
    cachedBlogData = null
  }
  
  if (!cachedBlogData) {
    cachedBlogData = await discoverBlogPosts()
  }
  return cachedBlogData
}

/**
 * Clear the cache (useful for development/testing)
 */
export function clearBlogCache(): void {
  cachedBlogData = null
  console.log('🧹 Blog cache cleared')
}

/**
 * Get a specific blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<ProcessedBlogPost | null> {
  const { posts } = await getAllBlogPosts()
  return posts.find(post => post.slug === slug) || null
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(category: string): Promise<ProcessedBlogPost[]> {
  const { posts } = await getAllBlogPosts()
  return posts.filter(post => post.category === category)
}

/**
 * Get recent blog posts
 */
export async function getRecentBlogPosts(limit: number = 5): Promise<ProcessedBlogPost[]> {
  const { posts } = await getAllBlogPosts()
  return posts.slice(0, limit)
}

/**
 * Get featured blog post (most recent or manually specified)
 */
export async function getFeaturedBlogPost(): Promise<ProcessedBlogPost | null> {
  const { posts } = await getAllBlogPosts()
  
  // For now, return the most recent post
  // In the future, we could add a 'featured' flag to frontmatter
  return posts[0] || null
}

/**
 * Search blog posts
 */
export async function searchBlogPosts(query: string): Promise<ProcessedBlogPost[]> {
  const { posts } = await getAllBlogPosts()
  
  if (!query.trim()) {
    return posts
  }

  const searchTerms = query.toLowerCase().split(/\s+/)
  
  return posts.filter(post => {
    const searchableText = [
      post.frontmatter.title,
      post.frontmatter.description,
      ...post.frontmatter.keywords,
      post.category || ''
    ].join(' ').toLowerCase()
    
    return searchTerms.every(term => searchableText.includes(term))
  })
}

/**
 * Get blog statistics
 */
export async function getBlogStats(): Promise<{
  totalPosts: number
  categoryCounts: Record<string, number>
  averageReadingTime: number
  lastUpdated: Date
}> {
  const { posts, lastUpdated } = await getAllBlogPosts()
  
  const categoryCounts: Record<string, number> = {}
  let totalReadingTime = 0
  
  posts.forEach(post => {
    if (post.category) {
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1
    }
    totalReadingTime += post.readingTime
  })
  
  return {
    totalPosts: posts.length,
    categoryCounts,
    averageReadingTime: posts.length > 0 ? Math.round(totalReadingTime / posts.length) : 0,
    lastUpdated
  }
}

/**
 * Development helper: Log blog discovery results
 */
export async function logBlogDiscovery(): Promise<void> {
  if (import.meta.env?.DEV) {
    const result = await getAllBlogPosts()
    console.group('🔍 Blog Discovery Results')
    console.log(`Found ${result.totalPosts} posts`)
    console.log(`Categories: ${result.categories.map(c => `${c.name} (${c.postCount})`).join(', ')}`)
    console.log('Posts:', result.posts.map(p => `${p.category || 'landing'}/${p.slug}`))
    console.groupEnd()
  }
}