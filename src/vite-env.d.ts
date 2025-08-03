/// <reference types="vite/client" />

// Add MDX module declarations
declare module '*.mdx' {
  import { ComponentType } from 'react'
  
  interface MDXModule {
    default: ComponentType
    frontmatter: Record<string, any>
  }
  
  const component: MDXModule
  export = component
}

// Environment variables interface
interface ImportMetaEnv {
  readonly VITE_GOOGLE_ANALYTICS_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}