import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProcessedBlogPost } from '../types/blog.types';
import { getRecentBlogPosts } from '../utils/post-discovery-runtime';
import { BlogPostList } from '../components/BlogPostList';

interface BlogNotFoundProps {}

const BlogNotFound: React.FC<BlogNotFoundProps> = () => {
  const [recentPosts, setRecentPosts] = useState<ProcessedBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentPosts() {
      try {
        const posts = await getRecentBlogPosts(4);
        setRecentPosts(posts);
      } catch (error) {
        console.error('Failed to load recent posts for 404 page:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRecentPosts();
  }, []);

  return (
    <div className="min-h-screen bg-chess-dark-primary text-white">
      <div className="container mx-auto px-4 py-16">
        {/* 404 Header */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
            <h2 className="text-3xl font-semibold text-white mb-4">
              Post Not Found
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Sorry, we couldn't find the resource you're looking for. 
              It might have been moved, renamed, or doesn't exist.
            </p>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/resources"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              Browse All Resources
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-2 text-sm text-slate-400">
              <span>or explore</span>
              <div className="flex gap-2">
                <Link to="/resources/tips" className="text-blue-400 hover:text-blue-300">
                  Tips
                </Link>
                <span>•</span>
                <Link to="/resources/guides" className="text-blue-400 hover:text-blue-300">
                  Guides
                </Link>
                <span>•</span>
                <Link to="/resources/news" className="text-blue-400 hover:text-blue-300">
                  News
                </Link>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            <Link to="/" className="text-blue-400 hover:text-blue-300">
              ← Return to AI CMS
            </Link>
          </div>
        </div>

        {/* Recent Posts Section */}
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-white mb-2">
              Recent Posts
            </h3>
            <p className="text-slate-400">
              Check out some of our latest content while you're here
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-slate-400">Loading recent posts...</span>
            </div>
          ) : (
            <BlogPostList
              posts={recentPosts}
              layout="grid"
              columns={2}
              showDescription={true}
              emptyMessage="No recent posts available"
            />
          )}
        </div>

        {/* Help Section */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-chess-dark-secondary rounded-lg p-8">
            <h4 className="text-xl font-semibold text-white mb-4">
              Still can't find what you're looking for?
            </h4>
            <p className="text-slate-400 mb-6">
              Our resources are organized into categories to help you build better content experiences.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-white mb-2">Tips</h5>
                <p className="text-sm text-slate-400">Quick advice and best practices</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h5 className="font-semibold text-white mb-2">Guides</h5>
                <p className="text-sm text-slate-400">Comprehensive tutorials and setup guides</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-white mb-2">Facts</h5>
                <p className="text-sm text-slate-400">Interesting insights and information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogNotFound;