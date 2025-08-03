import React, { Suspense } from 'react';
import { BlogImage } from './BlogImage';

// Lazy load heavy components
const TableOfContents = React.lazy(() => import('./TableOfContents'));
const ShareButtons = React.lazy(() => import('./ShareButtons'));

// Enhanced img component that automatically optimizes blog images
const OptimizedImg = React.memo(({ 
  src, 
  alt, 
  title, 
  width, 
  height, 
  className = '',
  ...props 
}: {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
  [key: string]: any;
}) => {
  // External images - use regular img tag
  if (src.startsWith('http') || src.startsWith('//')) {
    return (
      <img 
        src={src} 
        alt={alt} 
        title={title} 
        width={width} 
        height={height} 
        className={className}
        loading="lazy"
        decoding="async"
        {...props} 
      />
    );
  }
  
  // SVG images - use regular img tag
  if (src.endsWith('.svg')) {
    return (
      <img 
        src={src} 
        alt={alt} 
        title={title} 
        width={width} 
        height={height} 
        className={className}
        loading="lazy"
        {...props} 
      />
    );
  }
  
  // Local images - use optimized BlogImage
  return (
    <BlogImage
      src={src}
      alt={alt}
      caption={title}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
});

// Enhanced heading components with anchor links
const HeadingWithAnchor = React.memo(({ 
  level, 
  children, 
  ...props 
}: { 
  level: 1 | 2 | 3 | 4 | 5 | 6; 
  children: React.ReactNode;
  [key: string]: any;
}) => {
  const id = typeof children === 'string' 
    ? children.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    : undefined;
  
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  const className = `blog-heading blog-h${level} group relative`;
  
  return (
    <Component id={id} className={className} {...props}>
      {children}
      {id && (
        <a 
          href={`#${id}`} 
          className="ml-2 opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 transition-opacity"
          aria-label={`Link to ${children}`}
        >
          #
        </a>
      )}
    </Component>
  );
});

// Code block with syntax highlighting support
const CodeBlock = React.memo(({ 
  children, 
  className = '', 
  ...props 
}: { 
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  const language = className.replace(/language-/, '');
  
  return (
    <div className="blog-code-block relative">
      {language && (
        <div className="blog-code-language absolute top-2 right-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {language}
        </div>
      )}
      <pre className={`blog-pre ${className}`} {...props}>
        {children}
      </pre>
    </div>
  );
});

// Enhanced blockquote with styling
function Blockquote({ 
  children, 
  ...props 
}: { 
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <blockquote className="blog-blockquote border-l-4 border-blue-500 pl-6 py-2 my-6 bg-blue-50 italic" {...props}>
      {children}
    </blockquote>
  );
}

// Enhanced table with responsive styling
function Table({ 
  children, 
  ...props 
}: { 
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <div className="blog-table-container w-full overflow-x-auto my-8 rounded-lg border-2 border-chess-dark-tertiary shadow-xl bg-chess-dark-secondary">
      <table className="blog-table w-full border-collapse" {...props}>
        {children}
      </table>
    </div>
  );
}

// Callout component for special content
function Callout({ 
  type = 'info', 
  children, 
  title,
  ...props 
}: { 
  type?: 'info' | 'warning' | 'success' | 'error';
  children: React.ReactNode;
  title?: string;
  [key: string]: any;
}) {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };
  
  const icons = {
    info: '💡',
    warning: '⚠️',
    success: '✅',
    error: '❌'
  };
  
  return (
    <div className={`blog-callout border-l-4 p-4 my-6 rounded-r ${typeStyles[type]}`} {...props}>
      {title && (
        <div className="font-semibold mb-2 flex items-center gap-2">
          <span>{icons[type]}</span>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}


// Lazy loading wrapper for table of contents
const LazyTableOfContents = React.memo((props: any) => (
  <Suspense fallback={<div className="bg-gray-50 rounded-lg p-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>}>
    <TableOfContents {...props} />
  </Suspense>
));

// Lazy loading wrapper for share buttons
const LazyShareButtons = React.memo((props: any) => (
  <Suspense fallback={<div className="bg-gray-50 rounded-lg p-4 animate-pulse">
    <div className="flex space-x-2">
      <div className="h-10 w-10 bg-gray-200 rounded"></div>
      <div className="h-10 w-10 bg-gray-200 rounded"></div>
      <div className="h-10 w-10 bg-gray-200 rounded"></div>
    </div>
  </div>}>
    <ShareButtons {...props} />
  </Suspense>
));

// MDX component mapping
export const mdxComponents = {
  // Enhanced image component
  img: OptimizedImg,
  
  // Blog components (lazy loaded)
  TableOfContents: LazyTableOfContents,
  ShareButtons: LazyShareButtons,
  
  // Enhanced headings with anchor links
  h1: (props: any) => <HeadingWithAnchor level={1} {...props} />,
  h2: (props: any) => <HeadingWithAnchor level={2} {...props} />,
  h3: (props: any) => <HeadingWithAnchor level={3} {...props} />,
  h4: (props: any) => <HeadingWithAnchor level={4} {...props} />,
  h5: (props: any) => <HeadingWithAnchor level={5} {...props} />,
  h6: (props: any) => <HeadingWithAnchor level={6} {...props} />,
  
  // Enhanced code blocks
  pre: CodeBlock,
  
  // Enhanced blockquotes
  blockquote: Blockquote,
  
  // Enhanced tables
  table: Table,
  th: (props: any) => (
    <th 
      className="border-2 border-chess-dark-tertiary px-6 py-4 bg-chess-dark-primary text-white font-semibold text-left text-sm tracking-wide" 
      {...props} 
    />
  ),
  td: (props: any) => (
    <td 
      className="border border-chess-dark-tertiary px-6 py-4 text-slate-300 text-sm leading-relaxed" 
      {...props} 
    />
  ),
  thead: (props: any) => <thead className="bg-chess-dark-primary" {...props} />,
  tbody: (props: any) => <tbody className="bg-chess-dark-secondary divide-y divide-chess-dark-tertiary" {...props} />,
  tr: (props: any) => <tr className="border-b border-chess-dark-tertiary hover:bg-chess-dark-tertiary/30 transition-colors duration-200" {...props} />,
  
  // Custom components
  Callout,
  
  // Enhanced paragraphs with better spacing
  p: (props: any) => <p className="blog-paragraph mb-4 leading-relaxed" {...props} />,
  
  // Enhanced lists
  ul: (props: any) => <ul className="blog-ul list-disc pl-6 mb-4 space-y-1" {...props} />,
  ol: (props: any) => <ol className="blog-ol list-decimal pl-6 mb-4 space-y-1" {...props} />,
  li: (props: any) => <li className="blog-li" {...props} />,
  
  // Enhanced links
  a: ({ href, children, ...props }: any) => {
    const isExternal = href?.startsWith('http') || href?.startsWith('//');
    return (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 underline decoration-blue-600/30 hover:decoration-blue-800/50 transition-colors"
        {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        {...props}
      >
        {children}
        {isExternal && (
          <span className="inline-block ml-1 text-xs">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-3.5a.75.75 0 011.5 0v3.5A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h3.5a.75.75 0 010 1.5h-3.5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </a>
    );
  }
};

// Default export for easy importing
export default mdxComponents;