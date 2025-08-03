/**
 * Related Posts Utility
 * Finds related blog posts based on category, keywords, and recency
 */

import { ProcessedBlogPost } from '../types/blog.types';

export interface RelatedPostsOptions {
  /** Number of related posts to return (default: 3) */
  limit?: number;
  /** Minimum score threshold for related posts (default: 0) */
  minScore?: number;
}

export interface ScoredPost {
  post: ProcessedBlogPost;
  score: number;
  reasons: string[];
}

/**
 * Find related posts for a given post
 * Uses a scoring algorithm to rank posts by relevance
 */
export function findRelatedPosts(
  currentPost: ProcessedBlogPost,
  allPosts: ProcessedBlogPost[],
  options: RelatedPostsOptions = {}
): ProcessedBlogPost[] {
  const { limit = 3, minScore = 0 } = options;
  
  // Filter out the current post
  const candidates = allPosts.filter(post => post.slug !== currentPost.slug);
  
  // Score each candidate post
  const scoredPosts = candidates.map(post => scorePost(currentPost, post));
  
  // Sort by score (descending) and take top results
  const sortedPosts = scoredPosts
    .filter(scored => scored.score > minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return sortedPosts.map(scored => scored.post);
}

/**
 * Score a candidate post against the current post
 * Scoring algorithm:
 * - Same category: +10 points
 * - Each matching keyword: +5 points
 * - Recent date: +1 point per day recency (max 30 days)
 */
function scorePost(currentPost: ProcessedBlogPost, candidatePost: ProcessedBlogPost): ScoredPost {
  let score = 0;
  const reasons: string[] = [];
  
  // Category matching (highest priority)
  if (currentPost.category && candidatePost.category === currentPost.category) {
    score += 10;
    reasons.push(`Same category: ${currentPost.category}`);
  }
  
  // Keywords matching
  const currentKeywords = currentPost.frontmatter.keywords || [];
  const candidateKeywords = candidatePost.frontmatter.keywords || [];
  
  if (currentKeywords.length > 0 && candidateKeywords.length > 0) {
    const matchingKeywords = currentKeywords.filter(keyword => 
      candidateKeywords.some(candidateKeyword => 
        candidateKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(candidateKeyword.toLowerCase())
      )
    );
    
    if (matchingKeywords.length > 0) {
      score += matchingKeywords.length * 5;
      reasons.push(`${matchingKeywords.length} matching keywords`);
    }
  }
  
  // Recency bonus (newer posts get higher scores)
  const currentDate = new Date(currentPost.frontmatter.date);
  const candidateDate = new Date(candidatePost.frontmatter.date);
  const daysDifference = Math.abs(currentDate.getTime() - candidateDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDifference <= 30) {
    const recencyBonus = Math.max(0, Math.round(30 - daysDifference) / 30);
    score += recencyBonus;
    if (recencyBonus > 0) {
      reasons.push(`Recent post (${Math.round(daysDifference)} days apart)`);
    }
  }
  
  return {
    post: candidatePost,
    score,
    reasons
  };
}

/**
 * Get fallback related posts when no good matches are found
 * Returns the most recent posts from the same category, or all recent posts
 */
export function getFallbackRelatedPosts(
  currentPost: ProcessedBlogPost,
  allPosts: ProcessedBlogPost[],
  limit: number = 3
): ProcessedBlogPost[] {
  // Filter out the current post
  const candidates = allPosts.filter(post => post.slug !== currentPost.slug);
  
  // First try to get recent posts from the same category
  if (currentPost.category) {
    const sameCategoryPosts = candidates
      .filter(post => post.category === currentPost.category)
      .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
      .slice(0, limit);
    
    if (sameCategoryPosts.length >= limit) {
      return sameCategoryPosts;
    }
    
    // If not enough same-category posts, fill with recent posts from other categories
    const otherPosts = candidates
      .filter(post => post.category !== currentPost.category)
      .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
      .slice(0, limit - sameCategoryPosts.length);
    
    return [...sameCategoryPosts, ...otherPosts];
  }
  
  // If no category, just return most recent posts
  return candidates
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
    .slice(0, limit);
}

/**
 * Get related posts with intelligent fallback
 * Combines the scoring algorithm with fallback logic
 */
export async function getRelatedPosts(
  currentPost: ProcessedBlogPost,
  allPosts: ProcessedBlogPost[],
  options: RelatedPostsOptions = {}
): Promise<ProcessedBlogPost[]> {
  const { limit = 3 } = options;
  
  // Try to find related posts using scoring algorithm
  const relatedPosts = findRelatedPosts(currentPost, allPosts, options);
  
  // If we don't have enough related posts, use fallback
  if (relatedPosts.length < limit) {
    const fallbackPosts = getFallbackRelatedPosts(currentPost, allPosts, limit);
    
    // Combine related posts with fallback, avoiding duplicates
    const combinedPosts = [...relatedPosts];
    
    for (const fallbackPost of fallbackPosts) {
      if (combinedPosts.length >= limit) break;
      
      // Only add if not already in the list
      if (!combinedPosts.some(existing => existing.slug === fallbackPost.slug)) {
        combinedPosts.push(fallbackPost);
      }
    }
    
    return combinedPosts.slice(0, limit);
  }
  
  return relatedPosts;
}

/**
 * Development helper: Explain why posts are related
 */
export function explainRelatedPosts(
  currentPost: ProcessedBlogPost,
  allPosts: ProcessedBlogPost[],
  options: RelatedPostsOptions = {}
): ScoredPost[] {
  const { limit = 3, minScore = 0 } = options;
  
  const candidates = allPosts.filter(post => post.slug !== currentPost.slug);
  const scoredPosts = candidates.map(post => scorePost(currentPost, post));
  
  return scoredPosts
    .filter(scored => scored.score > minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}