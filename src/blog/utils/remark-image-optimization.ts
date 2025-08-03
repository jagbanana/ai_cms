import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

interface ImageNode extends Element {
  tagName: 'img';
  properties: {
    src: string;
    alt?: string;
    title?: string;
    width?: string | number;
    height?: string | number;
    [key: string]: any;
  };
}

// Remark plugin to transform img tags to optimized BlogImage components
export function remarkImageOptimization() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img') {
        const imgNode = node as ImageNode;
        const { src, alt, title, width, height, ...otherProps } = imgNode.properties;
        
        // Skip if no src or alt (alt is required for accessibility)
        if (!src || !alt) {
          return;
        }

        // Check if the image is from blog-assets
        const isBlogAsset = src.includes('/blog-assets/') || src.includes('blog-assets/');
        
        if (isBlogAsset) {
          // Transform to BlogImage component
          node.tagName = 'BlogImage';
          node.properties = {
            src: src,
            alt: alt,
            ...(title && { caption: title }),
            ...(width && { width: typeof width === 'string' ? parseInt(width) : width }),
            ...(height && { height: typeof height === 'string' ? parseInt(height) : height }),
            ...otherProps
          };
        }
      }
    });
  };
}

// Plugin to process image imports at build time
export function remarkImageImports() {
  return (tree: Root) => {
    // Simple transformation - let the MDX components handle optimization
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img') {
        const src = node.properties?.src as string;
        
        if (src && src.startsWith('/blog-assets/')) {
          // Mark for optimization by adding a data attribute
          node.properties = {
            ...node.properties,
            'data-optimize': 'true'
          };
        }
      }
    });
  };
}

// generateImportName function removed - not used

// Alternative approach: Transform at runtime in MDX components
export const mdxImageComponents = {
  img: 'OptimizedImg' // This will be replaced by the actual component in MDXComponents.tsx
};

// Helper function to detect if an image should be optimized
export function shouldOptimizeImage(src: string): boolean {
  // Don't optimize external images
  if (src.startsWith('http') || src.startsWith('//')) {
    return false;
  }
  
  // Don't optimize SVGs (they're already optimized)
  if (src.endsWith('.svg')) {
    return false;
  }
  
  // Optimize images from blog-assets
  if (src.includes('blog-assets')) {
    return true;
  }
  
  // Default to optimizing local images
  return !src.startsWith('http');
}

// Generate meta information for images
export function generateImageMeta(src: string, alt: string) {
  return {
    src,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1280px'
  };
}