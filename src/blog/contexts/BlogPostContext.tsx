import React, { createContext, useContext, ReactNode } from 'react';
import { ProcessedBlogPost } from '../types/blog.types';

interface BlogPostContextType {
  currentPost: ProcessedBlogPost | null;
}

const BlogPostContext = createContext<BlogPostContextType | null>(null);

interface BlogPostProviderProps {
  children: ReactNode;
  currentPost: ProcessedBlogPost | null;
}

export const BlogPostProvider: React.FC<BlogPostProviderProps> = ({
  children,
  currentPost,
}) => {
  return (
    <BlogPostContext.Provider value={{ currentPost }}>
      {children}
    </BlogPostContext.Provider>
  );
};

export const useBlogPost = (): BlogPostContextType => {
  const context = useContext(BlogPostContext);
  if (!context) {
    return { currentPost: null };
  }
  return context;
};

export default BlogPostContext;