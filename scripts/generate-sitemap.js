#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root directory
const projectRoot = join(__dirname, '..');
const sitemapPath = join(projectRoot, 'public', 'sitemap.xml');

// Base URL for the site
const BASE_URL = 'https://chesstrainer.org';

// Category information
const BLOG_CATEGORIES = {
  tips: {
    name: "Tips",
    description: "Quick chess tips and tricks to improve your game",
    slug: "tips"
  },
  news: {
    name: "News", 
    description: "Updates and announcements about Chess Trainer",
    slug: "news"
  },
  guides: {
    name: "Guides",
    description: "In-depth chess tutorials and strategies",
    slug: "guides"
  },
  facts: {
    name: "Fun Facts",
    description: "Interesting chess trivia and facts",
    slug: "facts"
  }
};

/**
 * Parse frontmatter from MDX file content
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return {};
  }
  
  const frontmatterContent = match[1];
  const frontmatter = {};
  
  // Simple YAML parsing for basic key-value pairs
  const lines = frontmatterContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim();
        let value = trimmed.substring(colonIndex + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        frontmatter[key] = value;
      }
    }
  }
  
  return frontmatter;
}

/**
 * Extract category from file path
 */
function extractCategoryFromPath(filePath) {
  // Split the path and look for category folders
  const pathParts = filePath.split('/');
  
  // For paths like 'tips/test-chess-tips.mdx', the first part is the category
  const potentialCategory = pathParts[0];
  
  // Check if it's a valid category
  if (Object.keys(BLOG_CATEGORIES).includes(potentialCategory)) {
    return potentialCategory;
  }
  
  // If not found, return null (landing page)
  return null;
}

/**
 * Generate slug from file path
 */
function generateSlugFromPath(filePath) {
  const fileName = filePath.split('/').pop();
  return fileName.replace(/\.mdx?$/, '');
}

/**
 * Generate URL for a blog post
 */
function generatePostUrl(slug, category) {
  if (category) {
    return `/resources/${category}/${slug}`;
  }
  // Landing pages go directly under root
  return `/${slug}`;
}

/**
 * Discover all blog posts
 */
async function discoverBlogPosts() {
  const postsDir = join(projectRoot, 'src', 'blog', 'posts');
  const posts = [];
  
  try {
    // Recursively find all .mdx files
    async function findMdxFiles(dir, relativePath = '') {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const entryRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          await findMdxFiles(fullPath, entryRelativePath);
        } else if (entry.name.endsWith('.mdx')) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const frontmatter = parseFrontmatter(content);
            
            const category = extractCategoryFromPath(entryRelativePath);
            const slugFromPath = generateSlugFromPath(entry.name);
            const slug = frontmatter.slug || slugFromPath;
            
            const post = {
              slug,
              category,
              url: generatePostUrl(slug, category),
              frontmatter,
              filePath: entryRelativePath,
              lastModified: frontmatter.date || new Date().toISOString().split('T')[0]
            };
            
            posts.push(post);
          } catch (error) {
            console.error(`Error processing ${fullPath}:`, error.message);
          }
        }
      }
    }
    
    await findMdxFiles(postsDir);
  } catch (error) {
    console.error('Error discovering blog posts:', error.message);
  }
  
  return posts;
}

/**
 * Generate XML sitemap
 */
function generateSitemapXml(posts) {
  const urls = [];
  
  // Add main blog page
  urls.push({
    loc: `${BASE_URL}/resources`,
    changefreq: 'daily',
    priority: '0.8'
  });
  
  // Add category pages
  for (const categoryKey of Object.keys(BLOG_CATEGORIES)) {
    urls.push({
      loc: `${BASE_URL}/resources/${categoryKey}`,
      changefreq: 'weekly',
      priority: '0.7'
    });
  }
  
  // Add individual blog posts
  for (const post of posts) {
    urls.push({
      loc: `${BASE_URL}${post.url}`,
      lastmod: post.lastModified,
      changefreq: 'monthly',
      priority: '0.6'
    });
  }
  
  // Generate XML
  const urlElements = urls.map(url => {
    let urlXml = `    <url>
      <loc>${url.loc}</loc>`;
    
    if (url.lastmod) {
      urlXml += `
      <lastmod>${url.lastmod}</lastmod>`;
    }
    
    urlXml += `
      <changefreq>${url.changefreq}</changefreq>
      <priority>${url.priority}</priority>
    </url>`;
    
    return urlXml;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

/**
 * Main function to generate sitemap
 */
async function generateSitemap() {
  try {
    console.log('🗺️  Generating sitemap...');
    
    // Discover all blog posts
    const posts = await discoverBlogPosts();
    console.log(`📄 Found ${posts.length} blog posts`);
    
    // Log discovered posts for debugging
    if (posts.length > 0) {
      console.log('📋 Discovered posts:');
      posts.forEach(post => {
        console.log(`   - ${post.category || 'landing'}/${post.slug} -> ${post.url}`);
      });
    }
    
    // Generate sitemap XML
    const sitemapXml = generateSitemapXml(posts);
    
    // Ensure public directory exists
    const publicDir = join(projectRoot, 'public');
    try {
      await fs.access(publicDir);
    } catch {
      await fs.mkdir(publicDir, { recursive: true });
    }
    
    // Write sitemap to file
    await fs.writeFile(sitemapPath, sitemapXml, 'utf-8');
    
    // Count URLs in sitemap
    const urlCount = (sitemapXml.match(/<url>/g) || []).length;
    
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📊 Total URLs: ${urlCount}`);
    console.log(`   - Main blog page: 1`);
    console.log(`   - Category pages: ${Object.keys(BLOG_CATEGORIES).length}`);
    console.log(`   - Individual posts: ${posts.length}`);
    console.log(`📍 Saved to: ${sitemapPath}`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the sitemap generation
generateSitemap();