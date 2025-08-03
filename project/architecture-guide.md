# AI CMS Architecture Document
## Technical Design & Implementation Details

### 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   AI CMS System Architecture                 │
├─────────────────────────────────────────────────────────────┤
│                         Build Time                           │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  MDX Files  │───▶│ Vite Plugin  │───▶│ React Comps   │  │
│  │  (.mdx)     │    │ MDX Loader   │    │ (JSX + Meta)  │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                         Runtime                              │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   Router    │───▶│ Blog Store   │───▶│ UI Components │  │
│  │  (Dynamic)  │    │  (Zustand)   │    │ (Rendered)    │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2. Build Pipeline Design

#### 2.1 MDX Processing Pipeline
```typescript
// vite.config.ts additions
import mdx from '@mdx-js/rollup'
import { remarkPlugins, rehypePlugins } from './src/blog/config/mdx-plugins'

export default defineConfig({
  plugins: [
    react(),
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        remarkGfm,
        remarkImageOptimization, // Custom plugin for image optimization
      ],
      rehypePlugins: [
        rehypeSlug,
        rehypeAutolinkHeadings,
        rehypePrism, // Syntax highlighting
      ],
    })
  ],
})
```

#### 2.2 Content Discovery System
```typescript
// src/blog/utils/post-discovery.ts
interface BlogPostModule {
  default: React.ComponentType
  frontmatter: BlogFrontmatter
  slug: string
  readingTime: number
}

// Use Vite's glob import for discovering posts
const posts = import.meta.glob<BlogPostModule>(
  '/src/blog/posts/**/*.mdx',
  { eager: true }
)

// Process and categorize posts at build time
export const processedPosts = Object.entries(posts).map(([path, module]) => {
  const slug = generateSlugFromPath(path)
  const category = extractCategoryFromPath(path)
  return {
    ...module.frontmatter,
    slug,
    category,
    component: module.default,
    readingTime: module.readingTime,
  }
})
```

### 3. Routing Architecture

#### 3.1 Dynamic Route Configuration
```typescript
// src/blog/routes/BlogRoutes.tsx
import { Routes, Route } from 'react-router-dom'
import { BlogLayout } from '../components/BlogLayout'
import { BlogHome } from '../pages/BlogHome'
import { CategoryPage } from '../pages/CategoryPage'
import { BlogPostPage } from '../pages/BlogPostPage'

export function BlogRoutes() {
  return (
    <Routes>
      <Route path="/resources" element={<BlogLayout />}>
        <Route index element={<BlogHome />} />
        <Route path=":category" element={<CategoryPage />} />
        <Route path=":category/:slug" element={<BlogPostPage />} />
        {/* Landing pages without category */}
        <Route path=":slug" element={<BlogPostPage />} />
      </Route>
    </Routes>
  )
}
```

#### 3.2 Route Matching Logic
```typescript
// Determine if a route is a category or a landing page
function resolveContentRoute(path: string): RouteType {
  const segments = path.split('/')
  const firstSegment = segments[0]
  
  // Check if it's a known category
  if (CONTENT_CATEGORIES.includes(firstSegment)) {
    return { type: 'category-post', category: firstSegment, slug: segments[1] }
  }
  
  // Otherwise, it's a landing page
  return { type: 'landing-page', slug: firstSegment }
}
```

### 4. State Management Architecture

#### 4.1 Content Store Design (Zustand)
```typescript
// src/blog/store/blogStore.ts
interface ContentState {
  // Post data
  posts: ProcessedBlogPost[]
  categories: CategoryInfo[]
  
  // UI state
  currentCategory: string | null
  searchQuery: string
  currentPage: number
  postsPerPage: number
  
  // Computed values
  filteredPosts: ProcessedBlogPost[]
  paginatedPosts: ProcessedBlogPost[]
  totalPages: number
  
  // Actions
  setCategory: (category: string | null) => void
  setSearchQuery: (query: string) => void
  setPage: (page: number) => void
  getPostBySlug: (slug: string) => ProcessedBlogPost | undefined
  getRelatedPosts: (post: ProcessedBlogPost, limit?: number) => ProcessedBlogPost[]
}

export const useBlogStore = create<ContentState>((set, get) => ({
  posts: processedPosts,
  categories: extractCategories(processedPosts),
  
  // ... implementation
}))
```

### 5. Component Architecture

#### 5.1 Component Hierarchy
```
BlogLayout (Template wrapper)
├── BlogHeader (Navigation)
├── BlogContent (Main area)
│   ├── BlogHome
│   │   ├── FeaturedPost
│   │   ├── RecentPosts
│   │   └── CategoryGrid
│   ├── CategoryPage
│   │   ├── CategoryHeader
│   │   └── PostGrid
│   └── BlogPostPage
│       ├── PostHeader
│       ├── TableOfContents
│       ├── MDXContent
│       ├── ContentComponents
│       └── RelatedPosts
└── BlogFooter (CTA section)
```

#### 5.2 MDX Component Mapping
```typescript
// src/blog/components/MDXComponents.tsx
import { CodeBlock } from './CodeBlock'
import { Callout } from './Callout'
import { YouTubeEmbed } from './YouTubeEmbed'
import { ContentTable } from './ContentTable'

export const mdxComponents = {
  // Content-specific components
  ContentTable,
  FeatureComparison: lazy(() => import('./FeatureComparison')),
  
  // Enhanced markdown elements
  pre: CodeBlock,
  blockquote: Callout,
  
  // Media embeds
  YouTube: YouTubeEmbed,
  
  // Override default elements for consistent styling
  h1: (props) => <h1 className="blog-h1" {...props} />,
  h2: (props) => <h2 className="blog-h2" id={generateId(props.children)} {...props} />,
  h3: (props) => <h3 className="blog-h3" id={generateId(props.children)} {...props} />,
  
  // Tables with Tailwind styling
  table: (props) => <table className="blog-table" {...props} />,
  
  // Links with external detection
  a: (props) => <SmartLink {...props} />,
}
```

### 6. Content Integration Architecture

#### 6.1 Content Table Component
```typescript
// src/blog/components/ContentTable.tsx
interface ContentTableProps {
  data: Record<string, any>[]
  caption?: string
  highlightKey?: string
  variant?: 'default' | 'comparison' | 'feature-list'
}

export function ContentTable({ 
  data, 
  caption, 
  highlightKey,
  variant = 'default'
}: ContentTableProps) {
  // Render styled table based on variant
  // Support for feature comparisons, pricing tables, etc.
}
```

#### 6.2 Content Analytics Integration
```typescript
// Custom analytics for content performance
export function trackContentEvent(event: ContentEvent) {
  // Pattern to track content engagement
  const contentData = {
    type: event.type, // 'view', 'scroll', 'cta_click'
    content_id: event.contentId,
    category: event.category,
    reading_time: event.readingTime,
    user_engagement: event.engagementScore
  }
  
  // Send to analytics platform
  window.gtag?.('event', event.type, contentData)
}
```

### 7. SEO Implementation Architecture

#### 7.1 Meta Tag System
```typescript
// src/blog/components/BlogSEO.tsx
interface BlogSEOProps {
  title: string
  description: string
  image?: string
  article?: {
    publishedTime: string
    modifiedTime?: string
    author: string
    tags: string[]
  }
  slug: string
}

export function BlogSEO({ title, description, image, article, slug }: BlogSEOProps) {
  const canonicalUrl = `https://your-domain.com${slug}`
  
  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title} | AI CMS</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      
      {/* Article specific */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:author" content={article.author} />
          {article.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData({ title, description, article, canonicalUrl }))}
      </script>
    </Helmet>
  )
}
```

#### 7.2 Sitemap Generation
```typescript
// src/blog/utils/generate-sitemap.ts
export async function generateSitemap() {
  const posts = await getAllBlogPosts()
  const categories = CONTENT_CATEGORIES
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://your-domain.com/resources</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
      ${categories.map(cat => `
        <url>
          <loc>https://your-domain.com/resources/${cat}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join('')}
      ${posts.map(post => `
        <url>
          <loc>https://your-domain.com${post.url}</loc>
          <lastmod>${post.frontmatter.date}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.6</priority>
        </url>
      `).join('')}
    </urlset>`
  
  // Write to public directory during build
  await fs.writeFile('./public/sitemap.xml', sitemap)
}
```

### 8. Performance Optimization

#### 8.1 Code Splitting Strategy
```typescript
// Lazy load blog routes
const BlogRoutes = lazy(() => import('./blog/routes/BlogRoutes'))

// In main router
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/resources/*" element={<BlogRoutes />} />
</Suspense>
```

#### 8.2 Image Optimization
```typescript
// src/blog/components/BlogImage.tsx
export function BlogImage({ src, alt, caption }: BlogImageProps) {
  return (
    <figure className="blog-image-container">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        // Use srcset for responsive images
        srcSet={generateSrcSet(src)}
        sizes="(max-width: 768px) 100vw, 768px"
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
```

#### 8.3 Caching Strategy
```typescript
// Cache processed content data
const contentDataCache = new Map<string, ProcessedBlogPost>()

// Memoize expensive computations
export const getProcessedPost = memoize((slug: string) => {
  if (contentDataCache.has(slug)) {
    return contentDataCache.get(slug)
  }
  
  const processed = processPost(slug)
  contentDataCache.set(slug, processed)
  return processed
})
```

### 9. Development Workflow

#### 9.1 Hot Module Replacement for MDX
```typescript
// Configure HMR for content posts
if (import.meta.hot) {
  import.meta.hot.accept('./posts/**/*.mdx', (newModule) => {
    // Update content store with new content
    useBlogStore.setState({ 
      posts: processUpdatedPosts(newModule) 
    })
  })
}
```

#### 9.2 Development Utilities
```typescript
// Content-specific dev panel additions
export function ContentDevPanel() {
  const { posts, categories } = useBlogStore()
  
  return (
    <div className="content-dev-panel">
      <h3>Content Stats</h3>
      <ul>
        <li>Total Posts: {posts.length}</li>
        <li>Categories: {categories.map(c => c.name).join(', ')}</li>
        <li>Broken Links: {findBrokenLinks(posts).length}</li>
        <li>Missing Images: {findMissingImages(posts).length}</li>
      </ul>
    </div>
  )
}
```

### 10. Error Handling

#### 10.1 MDX Error Boundary
```typescript
export class MDXErrorBoundary extends Component {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="mdx-error">
          <h2>Error rendering content</h2>
          <pre>{this.state.error.message}</pre>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Stack trace</summary>
              <pre>{this.state.error.stack}</pre>
            </details>
          )}
        </div>
      )
    }
    
    return this.props.children
  }
}
```

### 11. Testing Strategy

#### 11.1 Content-Specific Tests
```typescript
// __tests__/blog/mdx-processing.test.ts
describe('MDX Processing', () => {
  it('should parse frontmatter correctly', () => {
    const mdx = `---
title: Test Post
category: tips
---
# Content`
    
    const result = processMDX(mdx)
    expect(result.frontmatter.title).toBe('Test Post')
    expect(result.frontmatter.category).toBe('tips')
  })
  
  it('should handle content components', () => {
    const mdx = `<ContentTable data={[]} />`
    const result = processMDX(mdx)
    expect(result.components).toContainEqual(
      expect.objectContaining({ type: 'ContentTable' })
    )
  })
})
```

### 12. Migration & Deployment

#### 12.1 Build Process Updates
```json
// package.json scripts
{
  "scripts": {
    "build": "npm run build:content && vite build",
    "build:content": "node scripts/generate-content-metadata.js",
    "dev": "vite",
    "preview:content": "vite preview --open /resources"
  }
}
```

#### 12.2 Deployment Checklist
- [ ] Ensure all MDX files compile without errors
- [ ] Generate and validate sitemap
- [ ] Check all internal links
- [ ] Verify image optimization
- [ ] Test RSS feed generation
- [ ] Validate structured data
- [ ] Check route performance
- [ ] Ensure proper caching headers

### 13. Monitoring & Analytics

#### 13.1 Content-Specific Metrics
```typescript
// Track content engagement
export function trackContentEvent(event: ContentEvent) {
  // Send to analytics
  window.gtag?.('event', event.type, {
    category: 'content',
    label: event.label,
    value: event.value,
  })
  
  // Log for debugging
  logger.info('Content Event', event.type, event)
}

// Usage
trackContentEvent({
  type: 'content_view',
  label: post.slug,
  value: post.readingTime,
})
```

### 14. CTA Integration Architecture

#### 14.1 Configurable CTA System
```typescript
// src/utils/cta-config.ts
interface CTAConfig {
  heading: string
  subheading: string
  buttonText: string
  buttonUrl: string
  enabled: boolean
}

export function getCTAConfig(ctaName: string): CTAConfig {
  const prefix = `VITE_CTA_${ctaName.toUpperCase()}_`
  
  return {
    heading: import.meta.env[`${prefix}HEADING`] || getDefaultCTA(ctaName).heading,
    subheading: import.meta.env[`${prefix}SUBHEADING`] || getDefaultCTA(ctaName).subheading,
    buttonText: import.meta.env[`${prefix}BUTTON_TEXT`] || getDefaultCTA(ctaName).buttonText,
    buttonUrl: import.meta.env[`${prefix}BUTTON_URL`] || getDefaultCTA(ctaName).buttonUrl,
    enabled: import.meta.env[`${prefix}ENABLED`] !== 'false',
  }
}
```

#### 14.2 CTA Component Integration
```typescript
// Integration with blog posts and layout
export function CTASection({ ctaName, variant = 'default' }: CTASectionProps) {
  const config = getCTAConfig(ctaName)
  
  if (!config.enabled) return null
  
  return (
    <section className={`cta-section cta-section--${variant}`}>
      <h3>{config.heading}</h3>
      <p>{config.subheading}</p>
      <Button href={config.buttonUrl}>
        {config.buttonText}
      </Button>
    </section>
  )
}
```