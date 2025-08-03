var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { visit } from 'unist-util-visit';
// Remark plugin to transform img tags to optimized BlogImage components
export function remarkImageOptimization() {
    return function (tree) {
        visit(tree, 'element', function (node) {
            if (node.tagName === 'img') {
                var imgNode = node;
                var _a = imgNode.properties, src = _a.src, alt = _a.alt, title = _a.title, width = _a.width, height = _a.height, otherProps = __rest(_a, ["src", "alt", "title", "width", "height"]);
                // Skip if no src or alt (alt is required for accessibility)
                if (!src || !alt) {
                    return;
                }
                // Check if the image is from blog-assets
                var isBlogAsset = src.includes('/blog-assets/') || src.includes('blog-assets/');
                if (isBlogAsset) {
                    // Transform to BlogImage component
                    node.tagName = 'BlogImage';
                    node.properties = __assign(__assign(__assign(__assign({ src: src, alt: alt }, (title && { caption: title })), (width && { width: typeof width === 'string' ? parseInt(width) : width })), (height && { height: typeof height === 'string' ? parseInt(height) : height })), otherProps);
                }
            }
        });
    };
}
// Plugin to process image imports at build time
export function remarkImageImports() {
    return function (tree) {
        // Simple transformation - let the MDX components handle optimization
        visit(tree, 'element', function (node) {
            var _a;
            if (node.tagName === 'img') {
                var src = (_a = node.properties) === null || _a === void 0 ? void 0 : _a.src;
                if (src && src.startsWith('/blog-assets/')) {
                    // Mark for optimization by adding a data attribute
                    node.properties = __assign(__assign({}, node.properties), { 'data-optimize': 'true' });
                }
            }
        });
    };
}
// generateImportName function removed - not used
// Alternative approach: Transform at runtime in MDX components
export var mdxImageComponents = {
    img: 'OptimizedImg' // This will be replaced by the actual component in MDXComponents.tsx
};
// Helper function to detect if an image should be optimized
export function shouldOptimizeImage(src) {
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
export function generateImageMeta(src, alt) {
    return {
        src: src,
        alt: alt,
        loading: 'lazy',
        decoding: 'async',
        sizes: '(max-width: 640px) 100vw, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1280px'
    };
}
