import React from 'react';
import { ProcessedBlogPost } from '../types/blog.types';
import { formatReadingTime } from '../utils/reading-time';

interface BlogPostHeaderProps {
  post: ProcessedBlogPost;
}

export const BlogPostHeader: React.FC<BlogPostHeaderProps> = ({ post }) => {
  const { frontmatter, category, readingTime } = post;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="mb-8">
      {/* Category Badge */}
      {category && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-600/30">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        </div>
      )}

      {/* Hero Image */}
      {frontmatter.image && (
        <div className="mt-8 flex justify-center">
          <img
            src={frontmatter.image}
            alt={frontmatter.title}
            className="max-w-full max-h-64 sm:max-h-80 h-auto object-contain rounded-lg border border-chess-dark-tertiary"
            style={{
              width: 'auto' // Ensure width adjusts to maintain aspect ratio
            }}
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Metadata - Now appears after the image */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mt-6">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span>{frontmatter.author}</span>
        </div>
        
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <time dateTime={frontmatter.date}>
            {formatDate(frontmatter.date)}
          </time>
        </div>

        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>{formatReadingTime(readingTime)}</span>
        </div>
      </div>
    </header>
  );
};

export default BlogPostHeader;