import { useState } from 'react';
import BlogAnalytics from '../utils/blog-analytics';

interface BlogImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // For above-the-fold images
  sizes?: string; // For responsive images
}

export function BlogImage({ 
  src, 
  alt, 
  caption, 
  className = '', 
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 768px'
}: BlogImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageError = () => {
    BlogAnalytics.trackImageError(src, alt, 'BlogImage');
    setImageError(true);
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  // Calculate aspect ratio for CLS prevention
  const aspectRatio = width && height ? (height / width) * 100 : undefined;
  
  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    if (baseSrc.includes('?')) {
      // Already has query params, append image optimization
      return `${baseSrc}&w=640 640w, ${baseSrc}&w=768 768w, ${baseSrc}&w=1024 1024w, ${baseSrc}&w=1280 1280w`;
    } else {
      // Add query params for vite-imagetools
      return `${baseSrc}?w=640 640w, ${baseSrc}?w=768 768w, ${baseSrc}?w=1024 1024w, ${baseSrc}?w=1280 1280w`;
    }
  };

  if (imageError) {
    return (
      <figure className={`my-6 ${className}`}>
        <div 
          className="bg-gray-200 border border-gray-300 rounded-lg p-8 text-center"
          style={{
            aspectRatio: aspectRatio ? `${width}/${height}` : undefined,
            minHeight: aspectRatio ? undefined : '200px'
          }}
        >
          <div className="text-4xl mb-2 text-gray-400">🖼️</div>
          <div className="text-sm text-gray-600 mb-1">Image not available</div>
          <div className="text-xs text-gray-500">{alt}</div>
        </div>
        {caption && (
          <figcaption className="text-sm text-slate-400 text-center mt-2 italic">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={`my-6 ${className}`}>
      <div 
        className="relative"
        style={{
          aspectRatio: aspectRatio ? `${width}/${height}` : undefined,
          minHeight: aspectRatio && typeof window !== 'undefined' && window.innerWidth < 640 
            ? undefined 
            : aspectRatio ? `${(height! / width!) * 300}px` : '200px'
        }}
      >
        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-gray-400">Loading image...</div>
          </div>
        )}
        <img
          src={src}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={`w-full h-auto object-contain sm:object-cover rounded-lg shadow-md ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            aspectRatio: aspectRatio ? `${width}/${height}` : undefined,
            maxWidth: '100%',
            height: typeof window !== 'undefined' && window.innerWidth < 640 ? 'auto' : undefined
          }}
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-slate-400 text-center mt-2 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}