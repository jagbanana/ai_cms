import { ProcessedBlogPost } from '../types/blog.types';

export interface SearchOptions {
  caseSensitive?: boolean;
  searchFields?: ('title' | 'description' | 'category' | 'content')[];
}

export function searchPosts(
  posts: ProcessedBlogPost[],
  query: string,
  options: SearchOptions = {}
): ProcessedBlogPost[] {
  if (!query.trim()) {
    return posts;
  }

  const {
    caseSensitive = false,
    searchFields = ['title', 'description', 'category']
  } = options;

  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const searchTerms = searchQuery.split(/\s+/).filter(term => term.length > 0);

  return posts.filter(post => {
    return searchTerms.every(term => {
      return searchFields.some(field => {
        const fieldValue = getFieldValue(post, field);
        const searchValue = caseSensitive ? fieldValue : fieldValue.toLowerCase();
        return searchValue.includes(term);
      });
    });
  });
}

function getFieldValue(post: ProcessedBlogPost, field: string): string {
  switch (field) {
    case 'title':
      return post.frontmatter.title || '';
    case 'description':
      return post.frontmatter.description || '';
    case 'category':
      return post.category || '';
    case 'content':
      // For now, we'll search in title and description
      // In the future, we could add full content search
      return (post.frontmatter.title || '') + ' ' + (post.frontmatter.description || '');
    default:
      return '';
  }
}

export function highlightSearchTerms(text: string, query: string): string {
  if (!query.trim()) {
    return text;
  }

  const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
  let highlightedText = text;

  searchTerms.forEach(term => {
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });

  return highlightedText;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getSearchResultsCount(posts: ProcessedBlogPost[], query: string): number {
  return searchPosts(posts, query).length;
}

export function getSearchSuggestions(posts: ProcessedBlogPost[], query: string): string[] {
  if (!query.trim()) {
    return [];
  }

  const suggestions = new Set<string>();
  const searchQuery = query.toLowerCase();

  posts.forEach(post => {
    // Extract words from title and description
    const words = [
      ...(post.frontmatter.title || '').toLowerCase().split(/\s+/),
      ...(post.frontmatter.description || '').toLowerCase().split(/\s+/),
      ...(post.category || '').toLowerCase().split(/\s+/)
    ];

    words.forEach(word => {
      if (word.length > 2 && word.startsWith(searchQuery)) {
        suggestions.add(word);
      }
    });
  });

  return Array.from(suggestions).slice(0, 5);
}