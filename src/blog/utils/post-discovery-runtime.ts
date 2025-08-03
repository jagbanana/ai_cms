/**
 * Runtime post discovery for development
 * This is a temporary solution while we resolve import.meta.glob issues
 */

import { ProcessedBlogPost, BlogDiscoveryResult, CategoryInfo } from '../types/blog.types'
import React, { ComponentType } from 'react'

// Import our new posts
import GettingStartedWithAICMS from '../posts/tips/getting-started-with-ai-cms.mdx'
import InstallationAndSetup from '../posts/guides/installation-and-setup.mdx'
import CompleteCustomizationGuide from '../posts/guides/complete-customization-guide.mdx'
import InterestingCMSFacts from '../posts/facts/interesting-cms-facts.mdx'

/**
 * Manual post discovery for development
 */
export async function discoverBlogPosts(): Promise<BlogDiscoveryResult> {
  try {
    console.log('[Blog Discovery] Starting runtime discovery...')
    console.log('[Blog Discovery] Available imports:', { GettingStartedWithAICMS, InstallationAndSetup, CompleteCustomizationGuide, InterestingCMSFacts })
    // Create posts from imported MDX files
    const processedPosts: ProcessedBlogPost[] = [
      {
        frontmatter: {
          title: "Getting Started with AI CMS",
          description: "Essential guide to help you start creating content with your new AI-powered CMS installation",
          date: "2024-01-15",
          slug: "getting-started-with-ai-cms",
          category: "tips",
          author: "AI CMS Team",
          image: "/blog-assets/getting-started-with-ai-cms-featured.svg",
          keywords: ["AI CMS", "getting started", "user guide", "MDX", "content creation", "blog setup"]
        },
        slug: "getting-started-with-ai-cms",
        category: "tips",
        url: "/resources/tips/getting-started-with-ai-cms",
        component: GettingStartedWithAICMS,
        readingTime: 5
      },
      {
        frontmatter: {
          title: "Installation and Setup Guide",
          description: "Complete guide to installing, configuring, and deploying AI CMS for your website",
          date: "2024-01-20",
          slug: "installation-and-setup",
          category: "guides",
          author: "AI CMS Team",
          image: "/blog-assets/installation-and-setup-featured.svg",
          keywords: ["AI CMS", "installation", "setup", "deployment", "configuration", "GitHub", "clone"]
        },
        slug: "installation-and-setup",
        category: "guides",
        url: "/resources/guides/installation-and-setup",
        component: InstallationAndSetup,
        readingTime: 10
      },
      {
        frontmatter: {
          title: "Complete AI CMS Customization Guide",
          description: "A comprehensive guide to customizing every aspect of your AI CMS installation",
          date: "2024-01-10",
          slug: "complete-customization-guide",
          category: "guides",
          author: "AI CMS Team",
          image: "/blog-assets/complete-customization-guide-featured.svg",
          keywords: ["AI CMS", "customization", "guide", "themes", "components", "MDX"]
        },
        slug: "complete-customization-guide",
        category: "guides",
        url: "/resources/guides/complete-customization-guide",
        component: CompleteCustomizationGuide,
        readingTime: 12
      },
      {
        frontmatter: {
          title: "10 Interesting Facts About Content Management Systems",
          description: "Discover fascinating facts about the history and evolution of content management systems",
          date: "2024-01-05",
          slug: "interesting-cms-facts",
          category: "facts",
          author: "AI CMS Team",
          image: "/blog-assets/interesting-cms-facts-featured.svg",
          keywords: ["CMS facts", "content management", "web history", "interesting facts"]
        },
        slug: "interesting-cms-facts",
        category: "facts",
        url: "/resources/facts/interesting-cms-facts",
        component: InterestingCMSFacts,
        readingTime: 5
      }
    ]

    // Sort posts by date (newest first)
    const sortedPosts = processedPosts.sort((a, b) => 
      new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    )

    // Generate category information
    const categories: CategoryInfo[] = [
      {
        name: "tips",
        displayName: "Tips",
        description: "Quick tips and best practices for using AI CMS",
        postCount: sortedPosts.filter(p => p.category === "tips").length,
        url: "/resources/tips"
      },
      {
        name: "guides",
        displayName: "Guides", 
        description: "In-depth tutorials and comprehensive guides",
        postCount: sortedPosts.filter(p => p.category === "guides").length,
        url: "/resources/guides"
      },
      {
        name: "news",
        displayName: "News",
        description: "Latest updates and announcements",
        postCount: sortedPosts.filter(p => p.category === "news").length,
        url: "/resources/news"
      },
      {
        name: "facts",
        displayName: "Fun Facts",
        description: "Interesting facts about CMS and web technology",
        postCount: sortedPosts.filter(p => p.category === "facts").length,
        url: "/resources/facts"
      }
    ]

    console.log('[Blog Discovery] Successfully created', sortedPosts.length, 'posts')
    console.log('[Blog Discovery] Categories:', categories.map(c => `${c.name} (${c.postCount})`))
    
    return {
      posts: sortedPosts,
      categories,
      totalPosts: sortedPosts.length,
      lastUpdated: new Date()
    }
  } catch (error) {
    console.error('Failed to discover blog posts:', error)
    
    // Return empty result rather than throwing
    return {
      posts: [],
      categories: [],
      totalPosts: 0,
      lastUpdated: new Date()
    }
  }
}

/**
 * Get all blog posts (cached)
 */
let cachedBlogData: BlogDiscoveryResult | null = null

export async function getAllBlogPosts(): Promise<BlogDiscoveryResult> {
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
 * Get featured blog post (most recent)
 */
export async function getFeaturedBlogPost(): Promise<ProcessedBlogPost | null> {
  const { posts } = await getAllBlogPosts()
  return posts[0] || null
}

/**
 * Development helper: Log blog discovery results
 */
export async function logBlogDiscovery(): Promise<void> {
  const result = await getAllBlogPosts()
  console.group('🔍 Blog Discovery Results (Runtime)')
  console.log(`Found ${result.totalPosts} posts`)
  console.log(`Categories: ${result.categories.map(c => `${c.name} (${c.postCount})`).join(', ')}`)
  console.log('Posts:', result.posts.map(p => `${p.category || 'landing'}/${p.slug}`))
  console.groupEnd()
}