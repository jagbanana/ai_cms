# AI CMS Extraction Plan

## Overview
This document outlines the plan to extract the blog/CMS functionality from the ChessTrainer.org codebase into a standalone, open-source "AI-First CMS for Node.js Websites" template.

## Project Goals
- Extract the fully-functional MDX-based blog system
- Remove all chess-specific functionality and content
- Create a generic template with Lorem ipsum content
- Preserve all blog features (SEO, image optimization, analytics, etc.)
- Make it easily customizable via environment variables
- Provide deployment configurations for popular platforms

## Extraction Phases

### Phase 1: Remove Chess-Specific Components and Dependencies

**Files/Directories to Delete:**
- `/src/components/Board/` - Chess board components
- `/src/components/Exercise/` - Chess exercise components
- `/src/components/Game/` - Chess game components
- `/src/components/Lesson/` - Lesson player components
- `/src/services/chessEngine.ts` - Stockfish integration
- `/src/services/puzzleLoader.ts` - Puzzle loading service
- `/src/services/lichessPuzzleLoader.ts` - Lichess puzzle integration
- `/src/hooks/useChessGame.ts` - Chess game hook
- `/src/hooks/useStockfish.ts` - Stockfish hook
- `/src/pages/LessonPage.tsx` - Lesson page
- `/src/pages/PracticeGame.tsx` - Practice game page
- `/src/data/curriculum/` - All chess curriculum content
- `/public/stockfish*` - Stockfish WASM files
- `/public/mock-stockfish-worker.js` - Mock Stockfish worker
- All existing blog posts in `/src/blog/posts/`

**Dependencies to Remove from package.json:**
- `chess.js`
- `react-chessboard`
- `stockfish.js`

**Files to Modify:**
- `/src/blog/components/MDXComponents.tsx` - Remove ChessPosition and PuzzlePosition component mappings
- `/src/blog/utils/remark-chess-notation.ts` - Remove or convert to generic syntax highlighting
- `/src/blog/components/ChessPosition.tsx` - Delete entirely
- `/src/blog/components/PuzzlePosition.tsx` - Delete entirely

### Phase 2: Clean Up Navigation, Routing, and Branding

**Files to Update:**
- `/src/App.tsx`
  - Remove all chess-specific routes
  - Keep only blog routes and home page
  - Simplify route structure

- `/src/components/Layout/Layout.tsx`
  - Update site branding to "AI CMS"
  - Remove "Practice" navigation item
  - Keep "Resources" dropdown with categories
  - Update mobile menu accordingly

- `/src/pages/HomePage.tsx`
  - Create new generic landing page
  - Lorem ipsum hero section
  - Feature list highlighting CMS capabilities
  - Call-to-action for exploring resources

- `/src/components/Layout/Footer.tsx`
  - Update all branding references
  - Remove chess-specific links
  - Add generic template links

**Text Updates:**
- Replace all "ChessTrainer.org" references with "AI CMS"
- Update meta descriptions and titles
- Remove chess-specific terminology

### Phase 3: Create Template Content

**New Blog Posts to Create:**
1. `/src/blog/posts/tips/getting-started-with-ai-cms.mdx`
   - Lorem ipsum content about quick tips
   - Example MDX features
   - Sample images and formatting

2. `/src/blog/posts/guides/complete-customization-guide.mdx`
   - Longer form Lorem ipsum content
   - Demonstrate table of contents
   - Multiple sections with headings

3. `/src/blog/posts/facts/interesting-cms-facts.mdx`
   - Shorter Lorem ipsum content
   - List format example
   - Fun fact presentation style

**Content Requirements:**
- Each post should demonstrate different MDX features
- Include proper frontmatter (title, description, date, category, author)
- Use generic placeholder images
- Show various content layouts

**Homepage Updates:**
- Hero section: "Welcome to AI CMS"
- Subtitle: "An AI-First Content Management System for Modern Websites"
- Feature cards highlighting:
  - MDX-powered content
  - SEO optimization
  - Image optimization
  - Performance monitoring
  - Easy deployment

### Phase 4: Environment Configuration

**Create .env.example:**
```env
# Site Configuration
VITE_SITE_NAME=AI CMS
VITE_SITE_URL=https://example.com
VITE_SITE_DESCRIPTION=AI-First Content Management System for Node.js
VITE_SITE_AUTHOR=Your Name

# Analytics (Optional)
VITE_GA_MEASUREMENT_ID=
VITE_PLAUSIBLE_DOMAIN=

# Social Media (Optional)
VITE_TWITTER_HANDLE=
VITE_GITHUB_URL=

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_COMMENTS=false
```

**Update Configuration Files:**
- Modify all hardcoded values to use environment variables
- Create helper functions for accessing env vars with defaults
- Update build scripts to validate required env vars

**Deployment Configurations:**
1. `vercel.json` - Vercel deployment config
2. `netlify.toml` - Netlify deployment config
3. `.github/workflows/deploy.yml` - GitHub Actions example

### Phase 5: Documentation and Final Cleanup

**Documentation to Create:**

1. **README.md**
   - Project overview and features
   - Quick start guide
   - Customization basics
   - Deployment instructions

2. **CUSTOMIZATION.md**
   - Detailed customization guide
   - Adding new categories
   - Modifying themes and colors
   - Creating custom MDX components
   - SEO configuration

3. **DEPLOYMENT.md**
   - Platform-specific deployment guides
   - Environment variable setup
   - Performance optimization tips
   - CDN configuration

4. **CONTRIBUTING.md**
   - Contribution guidelines
   - Development setup
   - Code style guide
   - Pull request process

**Update Existing Files:**
- `CLAUDE.md` - Remove chess references, focus on AI CMS development
- `package.json` - Update project name, description, and scripts
- Remove any chess-specific TypeScript types
- Clean up unused imports

**Final Cleanup Tasks:**
- Run linter and fix all issues
- Remove unused CSS classes
- Optimize bundle size
- Test all blog features
- Verify SEO functionality
- Check responsive design

## Technical Specifications

### Preserved Features
All blog functionality will be maintained:
- MDX content processing with frontmatter
- Automatic image optimization (WebP, responsive images)
- SEO optimization (meta tags, Open Graph, Twitter Cards)
- XML sitemap generation
- RSS/Atom feed generation
- Full-text search across posts
- Category filtering and pagination
- Related posts suggestions
- Table of contents generation
- Social sharing buttons
- Reading time estimation
- Analytics integration support
- Performance monitoring (Web Vitals)
- Syntax highlighting for code blocks
- Responsive design with Tailwind CSS
- Dark mode support (if implemented)

### Technology Stack (After Extraction)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Content**: MDX with custom remark plugins
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: Zustand (for blog features)
- **SEO**: React Helmet Async
- **Images**: vite-imagetools
- **Analytics**: Web Vitals + optional GA/Plausible

### Project Structure (After Extraction)
```
src/
├── blog/
│   ├── components/    # Blog UI components
│   ├── pages/        # Blog page components
│   ├── posts/        # MDX content files
│   └── utils/        # Blog utilities
├── components/       # Shared UI components
├── hooks/           # Custom React hooks
├── pages/           # Main app pages
├── services/        # Business logic
├── styles/          # Global styles
├── types/           # TypeScript definitions
└── utils/           # Shared utilities
```

## Success Criteria
The extraction will be considered successful when:
1. All chess-specific code and content is removed
2. Blog system functions independently
3. Three sample blog posts demonstrate key features
4. Site can be customized via environment variables
5. Documentation enables easy setup and customization
6. Deployment works on Vercel/Netlify with minimal configuration
7. All SEO and performance features remain functional
8. The template serves as a solid foundation for content-focused websites

## Future Enhancements (Post-Extraction)
- Plugin system for extending functionality
- Multiple theme options
- Admin interface for content management
- Markdown editor with live preview
- Comment system integration
- Newsletter subscription
- Multi-language support
- A/B testing capabilities