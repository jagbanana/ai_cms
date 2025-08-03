import { ProcessedBlogPost } from '../types/blog.types';

// Organization schema for Chess Trainer
const CHESS_TRAINER_ORGANIZATION = {
  "@type": "Organization",
  "name": "Chess Trainer",
  "url": "https://aicms.jaglab.org",
  "logo": {
    "@type": "ImageObject",
    "url": "https://aicms.jaglab.org/logo.png",
    "width": 512,
    "height": 512
  },
  "sameAs": [
    "https://github.com/chesstrainer",
    "https://twitter.com/chesstrainer"
  ]
};

// Default author for Chess Trainer posts
const CHESS_TRAINER_AUTHOR = {
  "@type": "Person",
  "name": "Chess Trainer Team",
  "url": "https://aicms.jaglab.org/about"
};

/**
 * Generate Article structured data for blog posts
 */
export function generateArticleSchema(post: ProcessedBlogPost): object {
  const baseUrl = "https://aicms.jaglab.org";
  const postUrl = post.category 
    ? `${baseUrl}/${post.category}/${post.slug}`
    : `${baseUrl}/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.frontmatter.title,
    "description": post.frontmatter.description,
    "image": post.frontmatter.image ? `${baseUrl}${post.frontmatter.image}` : undefined,
    "datePublished": post.frontmatter.date,
    "dateModified": post.frontmatter.dateModified || post.frontmatter.date,
    "author": post.frontmatter.author === "Chess Trainer Team" ? CHESS_TRAINER_AUTHOR : {
      "@type": "Person",
      "name": post.frontmatter.author
    },
    "publisher": CHESS_TRAINER_ORGANIZATION,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    },
    "keywords": post.frontmatter.keywords?.join(", "),
    "articleSection": post.category ? post.category.charAt(0).toUpperCase() + post.category.slice(1) : undefined,
    "wordCount": post.readingTime ? Math.round(post.readingTime * 200) : undefined, // Estimate ~200 words per minute
    "inLanguage": "en-US"
  };
}

/**
 * Generate BreadcrumbList structured data for navigation
 */
export function generateBreadcrumbSchema(path: string): object {
  const baseUrl = "https://aicms.jaglab.org";
  const segments = path.split('/').filter(Boolean);
  
  const breadcrumbs = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": baseUrl
    }
  ];

  // Add blog home if we're in blog section
  if (segments.includes('blog') || segments.length > 0) {
    breadcrumbs.push({
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": `${baseUrl}/blog`
    });
  }

  // Add category if present
  if (segments.length >= 2) {
    const category = segments[segments.length - 2];
    if (['tips', 'guides', 'news'].includes(category)) {
      breadcrumbs.push({
        "@type": "ListItem",
        "position": breadcrumbs.length + 1,
        "name": category.charAt(0).toUpperCase() + category.slice(1),
        "item": `${baseUrl}/${category}`
      });
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs
  };
}

/**
 * Generate WebSite structured data for homepage
 */
export function generateWebSiteSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Chess Trainer",
    "alternateName": "Chess Trainer App",
    "url": "https://aicms.jaglab.org",
    "description": "Learn chess through interactive lessons, exercises, and practice games. Master chess strategy and tactics with our comprehensive training system.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://aicms.jaglab.org/blog/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": CHESS_TRAINER_ORGANIZATION,
    "inLanguage": "en-US"
  };
}

/**
 * Generate FAQPage structured data (for guides with FAQ sections)
 */
export function generateFAQSchema(faqs: Array<{question: string; answer: string}>): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate HowTo structured data (for tutorial posts)
 */
export function generateHowToSchema(post: ProcessedBlogPost, steps: Array<{name: string; text: string}>): object {
  const baseUrl = "https://aicms.jaglab.org";
  const postUrl = post.category 
    ? `${baseUrl}/${post.category}/${post.slug}`
    : `${baseUrl}/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": post.frontmatter.title,
    "description": post.frontmatter.description,
    "image": post.frontmatter.image ? `${baseUrl}${post.frontmatter.image}` : undefined,
    "totalTime": post.readingTime ? `PT${Math.round(post.readingTime)}M` : undefined,
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "Chess board (physical or digital)"
      },
      {
        "@type": "HowToSupply", 
        "name": "Chess pieces"
      }
    ],
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text
    })),
    "author": post.frontmatter.author === "Chess Trainer Team" ? CHESS_TRAINER_AUTHOR : {
      "@type": "Person",
      "name": post.frontmatter.author
    },
    "publisher": CHESS_TRAINER_ORGANIZATION,
    "datePublished": post.frontmatter.date,
    "url": postUrl
  };
}

/**
 * Safely stringify JSON-LD data for script tags
 */
export function safeJsonLdStringify(data: object): string {
  return JSON.stringify(data, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * Generate multiple schemas for a blog post based on its content and type
 */
export function generatePostSchemas(post: ProcessedBlogPost, path: string): object[] {
  const schemas = [];
  
  // Always include Article schema
  schemas.push(generateArticleSchema(post));
  
  // Add BreadcrumbList for navigation
  schemas.push(generateBreadcrumbSchema(path));
  
  // Add category-specific schemas
  if (post.category === 'guides') {
    // Could add HowTo schema for tutorial posts
    // This would need to be determined based on post content
  }
  
  return schemas;
}