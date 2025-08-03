import { Helmet } from 'react-helmet-async';
import { 
  generateArticleSchema, 
  generateBreadcrumbSchema, 
  generateWebSiteSchema, 
  safeJsonLdStringify 
} from '../utils/structured-data';
import { ProcessedBlogPost } from '../types/blog.types';

interface BlogSEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'blog';
  post?: ProcessedBlogPost;
  canonical?: string;
  path?: string;
}

export function BlogSEO({
  title = 'Chess Training Resources | Tips, Guides & News',
  description = 'Learn chess with our comprehensive training resources. Find expert tips, in-depth guides, and latest news to improve your chess skills.',
  image = 'https://chesstrainer.org/assets/chess-trainer-og-image.jpg',
  type = 'website',
  post,
  canonical = 'https://chesstrainer.org/blog',
  path = '/blog'
}: BlogSEOProps) {
  const fullTitle = title.includes('Chess Trainer') ? title : `${title} | Chess Trainer`;
  
  // Generate structured data schemas
  const generateStructuredData = () => {
    const schemas = [];
    
    if (type === 'article' && post) {
      // Article schema for blog posts
      schemas.push(generateArticleSchema(post));
      
      // Breadcrumb schema for navigation
      schemas.push(generateBreadcrumbSchema(path));
    } else if (type === 'website' || type === 'blog') {
      // Website schema for homepage/blog home
      schemas.push(generateWebSiteSchema());
      
      // Breadcrumb schema if not root
      if (path && path !== '/') {
        schemas.push(generateBreadcrumbSchema(path));
      }
    }
    
    return schemas;
  };

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="Chess Trainer" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article specific meta tags */}
      {post && (
        <>
          <meta property="article:published_time" content={post.frontmatter.date} />
          {post.frontmatter.dateModified && (
            <meta property="article:modified_time" content={post.frontmatter.dateModified} />
          )}
          {post.frontmatter.author && (
            <meta property="article:author" content={post.frontmatter.author} />
          )}
          {post.frontmatter.keywords && post.frontmatter.keywords.map(keyword => (
            <meta key={keyword} property="article:tag" content={keyword} />
          ))}
          {post.category && (
            <meta property="article:section" content={post.category} />
          )}
        </>
      )}
      
      {/* RSS and Atom feeds */}
      <link 
        rel="alternate" 
        type="application/rss+xml" 
        title="Chess Trainer Resources RSS" 
        href="/rss.xml" 
      />
      <link 
        rel="alternate" 
        type="application/atom+xml" 
        title="Chess Trainer Resources Atom" 
        href="/atom.xml" 
      />
      
      {/* Favicon and app icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Structured data */}
      {generateStructuredData().map((schema, index) => (
        <script key={index} type="application/ld+json">
          {safeJsonLdStringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}