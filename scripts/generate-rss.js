#!/usr/bin/env node

/**
 * RSS Feed Generator for Chess Trainer Blog
 * Generates a valid RSS 2.0 feed with all blog posts
 */

import fs from 'fs';
import path from 'path';
import { Feed } from 'feed';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SITE_URL = 'https://chesstrainer.org';
const BLOG_BASE_URL = `${SITE_URL}/blog`;
const RSS_OUTPUT_PATH = path.join(__dirname, '../public/rss.xml');
const POSTS_DIR = path.join(__dirname, '../src/blog/posts');

// Feed metadata
const FEED_CONFIG = {
  title: 'Chess Trainer Resources',
  description: 'Learn chess with tips, guides, and news from Chess Trainer',
  id: `${SITE_URL}/resources`,
  link: `${SITE_URL}/resources`,
  language: 'en',
  image: `${SITE_URL}/blog-assets/chess-trainer-logo.png`,
  favicon: `${SITE_URL}/favicon.ico`,
  copyright: `Copyright © ${new Date().getFullYear()} Chess Trainer. All rights reserved.`,
  generator: 'Chess Trainer RSS Generator',
  feedLinks: {
    rss2: `${SITE_URL}/rss.xml`,
    atom: `${SITE_URL}/atom.xml`
  },
  author: {
    name: 'Chess Trainer Team',
    email: 'team@chesstrainer.org',
    link: SITE_URL
  }
};

/**
 * Get all MDX files recursively from the posts directory
 */
function getAllMdxFiles(dir) {
  const files = [];
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

/**
 * Extract category from file path
 */
function extractCategoryFromPath(filePath) {
  const relativePath = path.relative(POSTS_DIR, filePath);
  const pathParts = relativePath.split(path.sep);
  
  // If file is in a subdirectory, that's the category
  if (pathParts.length > 1) {
    return pathParts[0];
  }
  
  // If file is in root posts dir, it's a landing page (no category)
  return null;
}

/**
 * Generate URL for a blog post
 */
function generatePostUrl(slug, category) {
  if (category) {
    return `${BLOG_BASE_URL}/${category}/${slug}`;
  } else {
    // Landing page - direct URL
    return `${SITE_URL}/${slug}`;
  }
}

/**
 * Convert MDX content to HTML for RSS
 * This is a simplified conversion - in production you might want to use a proper MDX renderer
 */
function mdxToHtml(content) {
  // Simple conversions for common markdown elements
  let html = content
    // Headers
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    // Chess positions - convert to descriptive text
    .replace(/<ChessPosition[^>]*fen="([^"]*)"[^>]*\/?>/g, '<p><strong>Chess Position:</strong> $1</p>')
    // Remove other JSX components for RSS
    .replace(/<[A-Z][^>]*\/?>/g, '')
    // Basic paragraph wrapping
    .replace(/^(?!<[hH][1-6]>|<p>)(.+)$/gm, '<p>$1</p>')
    // Clean up multiple paragraph tags
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6]>)/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  
  return html;
}

/**
 * Process a single MDX file and extract post data
 */
function processPost(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: mdxContent } = matter(content);
    
    // Validate required fields
    if (!frontmatter.title || !frontmatter.description || !frontmatter.date || !frontmatter.slug) {
      console.warn(`Skipping ${filePath}: Missing required frontmatter fields`);
      return null;
    }
    
    const category = extractCategoryFromPath(filePath);
    const url = generatePostUrl(frontmatter.slug, category);
    const htmlContent = mdxToHtml(mdxContent);
    
    return {
      title: frontmatter.title,
      description: frontmatter.description,
      date: new Date(frontmatter.date),
      url,
      content: htmlContent,
      author: frontmatter.author || 'Chess Trainer Team',
      category,
      keywords: frontmatter.keywords || [],
      image: frontmatter.image ? `${SITE_URL}${frontmatter.image}` : null
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Generate RSS feed
 */
function generateRSSFeed() {
  console.log('🔄 Generating RSS feed...');
  
  // Initialize feed
  const feed = new Feed(FEED_CONFIG);
  
  // Get all MDX files
  const mdxFiles = getAllMdxFiles(POSTS_DIR);
  console.log(`📁 Found ${mdxFiles.length} MDX files`);
  
  // Process each file
  const posts = [];
  for (const filePath of mdxFiles) {
    const post = processPost(filePath);
    if (post) {
      posts.push(post);
    }
  }
  
  // Sort posts by date (newest first)
  posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  console.log(`📝 Processing ${posts.length} valid posts`);
  
  // Add each post to the feed
  for (const post of posts) {
    const feedItem = {
      title: post.title,
      id: post.url,
      link: post.url,
      description: post.description,
      content: post.content,
      author: [
        {
          name: post.author,
          email: 'team@chesstrainer.org',
          link: SITE_URL
        }
      ],
      date: post.date,
      category: post.category ? [{ name: post.category }] : [],
      guid: post.url
    };
    
    // Add image if available
    if (post.image) {
      feedItem.image = post.image;
    }
    
    // Add keywords as categories/tags
    if (post.keywords && post.keywords.length > 0) {
      feedItem.category = [
        ...feedItem.category,
        ...post.keywords.map(keyword => ({ name: keyword }))
      ];
    }
    
    feed.addItem(feedItem);
  }
  
  // Generate RSS XML
  const rssXml = feed.rss2();
  
  // Write to file
  fs.writeFileSync(RSS_OUTPUT_PATH, rssXml, 'utf8');
  
  console.log(`✅ RSS feed generated successfully at ${RSS_OUTPUT_PATH}`);
  console.log(`📊 Feed contains ${posts.length} posts`);
  
  // Also generate Atom feed
  const atomXml = feed.atom1();
  const atomPath = path.join(__dirname, '../public/atom.xml');
  fs.writeFileSync(atomPath, atomXml, 'utf8');
  console.log(`✅ Atom feed generated at ${atomPath}`);
  
  return {
    postsCount: posts.length,
    feedPath: RSS_OUTPUT_PATH,
    atomPath
  };
}

// Run the generator if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = generateRSSFeed();
    console.log('\n🎉 RSS feed generation completed successfully!');
    console.log(`📄 RSS: ${result.feedPath}`);
    console.log(`📄 Atom: ${result.atomPath}`);
    console.log(`📊 Posts: ${result.postsCount}`);
  } catch (error) {
    console.error('❌ RSS feed generation failed:', error);
    process.exit(1);
  }
}

export { generateRSSFeed };