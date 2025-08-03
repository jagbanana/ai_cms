/**
 * Frontmatter parsing and validation utilities for blog posts
 * Ensures consistent metadata structure across all MDX files
 */

import matter from 'gray-matter';

/**
 * Raw frontmatter structure as it appears in MDX files
 */
export interface RawFrontmatter {
  title?: string;
  description?: string;
  date?: string;
  dateModified?: string;
  slug?: string;
  category?: string;
  author?: string;
  image?: string;
  keywords?: string[];
  [key: string]: any; // Allow additional fields
}

/**
 * Validated and processed frontmatter with defaults applied
 */
export interface ProcessedFrontmatter {
  title: string;
  description: string;
  date: string;
  dateModified?: string;
  slug: string;
  category: string | null;
  author: string;
  image: string | null;
  keywords: string[];
}

/**
 * Frontmatter parsing result
 */
export interface FrontmatterParseResult {
  frontmatter: ProcessedFrontmatter;
  content: string;
  isEmpty: boolean;
}

/**
 * Frontmatter validation error with helpful details
 */
export class FrontmatterError extends Error {
  public readonly field: string;
  public readonly value: any;
  public readonly expected: string;

  constructor(field: string, value: any, expected: string, filePath?: string) {
    const location = filePath ? ` in ${filePath}` : '';
    super(`Invalid frontmatter${location}: Field '${field}' ${expected}. Got: ${JSON.stringify(value)}`);
    
    this.name = 'FrontmatterError';
    this.field = field;
    this.value = value;
    this.expected = expected;
  }
}

/**
 * Parse frontmatter from MDX content using gray-matter
 */
export function parseFrontmatter(
  content: string, 
  filePath?: string
): FrontmatterParseResult {
  try {
    // Use gray-matter to parse frontmatter and content
    const parsed = matter(content);
    
    // Validate and process the frontmatter
    const frontmatter = validateFrontmatter(parsed.data, filePath);
    
    return {
      frontmatter,
      content: parsed.content,
      isEmpty: !parsed.content.trim()
    };
  } catch (error) {
    if (error instanceof FrontmatterError) {
      throw error;
    }
    
    const location = filePath ? ` in ${filePath}` : '';
    throw new Error(`Failed to parse frontmatter${location}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate frontmatter and apply default values
 */
export function validateFrontmatter(
  raw: RawFrontmatter, 
  filePath?: string
): ProcessedFrontmatter {

  // Required field: title
  if (!raw.title || typeof raw.title !== 'string' || raw.title.trim() === '') {
    throw new FrontmatterError('title', raw.title, 'must be a non-empty string', filePath);
  }

  // Required field: description
  if (!raw.description || typeof raw.description !== 'string' || raw.description.trim() === '') {
    throw new FrontmatterError('description', raw.description, 'must be a non-empty string', filePath);
  }

  // Required field: date (YYYY-MM-DD format)
  if (!raw.date || typeof raw.date !== 'string') {
    throw new FrontmatterError('date', raw.date, 'must be a string in YYYY-MM-DD format', filePath);
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(raw.date)) {
    throw new FrontmatterError('date', raw.date, 'must be in YYYY-MM-DD format (e.g., "2024-01-15")', filePath);
  }

  // Validate date is actually valid
  const parsedDate = new Date(raw.date);
  if (isNaN(parsedDate.getTime())) {
    throw new FrontmatterError('date', raw.date, 'must be a valid date', filePath);
  }

  // Required field: slug
  if (!raw.slug || typeof raw.slug !== 'string' || raw.slug.trim() === '') {
    throw new FrontmatterError('slug', raw.slug, 'must be a non-empty string', filePath);
  }

  // Validate slug format (URL-friendly)
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(raw.slug)) {
    throw new FrontmatterError('slug', raw.slug, 'must be URL-friendly (lowercase letters, numbers, and hyphens only)', filePath);
  }

  // Optional field: category (null for landing pages)
  let category: string | null = null;
  if (raw.category !== undefined) {
    if (raw.category === null || raw.category === '') {
      category = null; // Explicitly set to null for landing pages
    } else if (typeof raw.category === 'string') {
      const validCategories = ['tips', 'guides', 'news', 'facts'];
      if (!validCategories.includes(raw.category)) {
        throw new FrontmatterError('category', raw.category, `must be one of: ${validCategories.join(', ')}, or null for landing pages`, filePath);
      }
      category = raw.category;
    } else {
      throw new FrontmatterError('category', raw.category, 'must be a string or null', filePath);
    }
  }

  // Optional field: author (default: "Chess Trainer Team")
  let author = 'Chess Trainer Team';
  if (raw.author !== undefined) {
    if (typeof raw.author !== 'string' || raw.author.trim() === '') {
      throw new FrontmatterError('author', raw.author, 'must be a non-empty string', filePath);
    }
    author = raw.author.trim();
  }

  // Optional field: image (default: null)
  let image: string | null = null;
  if (raw.image !== undefined) {
    if (raw.image === null || raw.image === '') {
      image = null;
    } else if (typeof raw.image === 'string') {
      // Basic validation for image path
      if (!raw.image.startsWith('/') && !raw.image.startsWith('http')) {
        throw new FrontmatterError('image', raw.image, 'must be an absolute path (starting with /) or full URL', filePath);
      }
      image = raw.image;
    } else {
      throw new FrontmatterError('image', raw.image, 'must be a string or null', filePath);
    }
  }

  // Optional field: keywords (default: [])
  let keywords: string[] = [];
  if (raw.keywords !== undefined) {
    if (!Array.isArray(raw.keywords)) {
      throw new FrontmatterError('keywords', raw.keywords, 'must be an array of strings', filePath);
    }
    
    // Validate each keyword
    for (let i = 0; i < raw.keywords.length; i++) {
      const keyword = raw.keywords[i];
      if (typeof keyword !== 'string' || keyword.trim() === '') {
        throw new FrontmatterError(`keywords[${i}]`, keyword, 'must be a non-empty string', filePath);
      }
    }
    
    // Clean and deduplicate keywords
    keywords = Array.from(new Set(
      raw.keywords
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0)
    ));
  }

  return {
    title: raw.title.trim(),
    description: raw.description.trim(),
    date: raw.date,
    slug: raw.slug.trim(),
    category,
    author,
    image,
    keywords
  };
}

/**
 * Check if frontmatter has all required fields (quick validation)
 */
export function hasRequiredFields(frontmatter: RawFrontmatter): boolean {
  try {
    validateFrontmatter(frontmatter);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get a list of missing required fields
 */
export function getMissingFields(frontmatter: RawFrontmatter): string[] {
  const missing: string[] = [];
  
  if (!frontmatter.title || typeof frontmatter.title !== 'string' || frontmatter.title.trim() === '') {
    missing.push('title');
  }
  
  if (!frontmatter.description || typeof frontmatter.description !== 'string' || frontmatter.description.trim() === '') {
    missing.push('description');
  }
  
  if (!frontmatter.date || typeof frontmatter.date !== 'string') {
    missing.push('date');
  }
  
  if (!frontmatter.slug || typeof frontmatter.slug !== 'string' || frontmatter.slug.trim() === '') {
    missing.push('slug');
  }
  
  return missing;
}

/**
 * Create example frontmatter for documentation
 */
export function getExampleFrontmatter(): string {
  return `---
title: "5 Essential Chess Opening Principles Every Beginner Should Know"
description: "Master these fundamental opening principles to start your chess games with confidence and avoid common beginner mistakes."
date: "2024-01-20"
slug: "chess-opening-principles-beginners"
category: "tips"
author: "Chess Trainer Team"
image: "/blog-assets/opening-principles-hero.jpg"
keywords: ["chess openings", "beginner chess", "chess principles", "chess strategy"]
---`;
}

/**
 * Utility to format frontmatter validation errors for developers
 */
export function formatValidationError(error: FrontmatterError): string {
  const suggestions: Record<string, string> = {
    title: 'Add a descriptive title like "5 Essential Chess Tips"',
    description: 'Add a brief description for SEO and social sharing',
    date: 'Use YYYY-MM-DD format like "2024-01-20"',
    slug: 'Use lowercase letters and hyphens like "chess-opening-tips"',
    category: 'Use "tips", "guides", "news", "facts", or null for landing pages',
    author: 'Use a name like "Chess Trainer Team" or "John Doe"',
    image: 'Use an absolute path like "/blog-assets/hero.jpg" or null',
    keywords: 'Use an array like ["chess", "strategy", "tips"]'
  };
  
  const suggestion = suggestions[error.field] || 'Check the field format and try again';
  
  return `${error.message}\n\nSuggestion: ${suggestion}\n\nExample frontmatter:\n${getExampleFrontmatter()}`;
}