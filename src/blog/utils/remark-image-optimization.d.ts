import type { Root } from 'hast';
export declare function remarkImageOptimization(): (tree: Root) => void;
export declare function remarkImageImports(): (tree: Root) => void;
export declare const mdxImageComponents: {
    img: string;
};
export declare function shouldOptimizeImage(src: string): boolean;
export declare function generateImageMeta(src: string, alt: string): {
    src: string;
    alt: string;
    loading: "lazy";
    decoding: "async";
    sizes: string;
};
