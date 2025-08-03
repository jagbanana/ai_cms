// React import removed - not needed for JSX in this setup
import { PostCardSkeleton } from './PostCardSkeleton';

interface PostListSkeletonProps {
  count?: number;
  showFeatured?: boolean;
}

export function PostListSkeleton({ count = 6, showFeatured = false }: PostListSkeletonProps) {
  return (
    <div className="space-y-8">
      {/* Featured post skeleton */}
      {showFeatured && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="h-64 md:h-96 bg-gray-300"></div>
            </div>
            <div className="md:w-1/2 p-8">
              <div className="w-20 h-5 bg-gray-300 rounded-full mb-4"></div>
              <div className="space-y-3 mb-6">
                <div className="h-8 bg-gray-300 rounded w-full"></div>
                <div className="h-8 bg-gray-300 rounded w-4/5"></div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                </div>
                <div className="w-20 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Posts grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}