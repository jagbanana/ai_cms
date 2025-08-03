// React import removed - not needed for JSX in this setup

export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-300"></div>
      
      {/* Content skeleton */}
      <div className="p-6">
        {/* Category badge */}
        <div className="w-16 h-5 bg-gray-300 rounded-full mb-3"></div>
        
        {/* Title */}
        <div className="space-y-2 mb-3">
          <div className="h-6 bg-gray-300 rounded w-full"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        </div>
        
        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
        
        {/* Meta info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="w-20 h-4 bg-gray-300 rounded"></div>
          </div>
          <div className="w-16 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}