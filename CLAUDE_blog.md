# AI CMS Blog Content Creation Guide

## Overview

This guide helps AI writers and content creators produce high-quality, SEO-optimized blog content for AI CMS projects. You'll be creating MDX blog posts with proper metadata, structured content, and optimized featured images.

## Prerequisites

Before creating content:
1. Ensure you're working from the project root directory
2. Read `/project/writing_guide.md` for target persona, ICP, and writing style guidelines
3. Understand that each post includes built-in call-to-actions via page templates - avoid adding CTAs in content
4. Review existing posts in your category for tone and structure examples

## Content Creation Workflow

### 1. File Structure

Create new posts in the appropriate category folder:
- `/src/blog/posts/tips/` - Quick actionable advice (500-800 words)
- `/src/blog/posts/guides/` - Comprehensive tutorials (1500-2500 words)
- `/src/blog/posts/news/` - Product updates and announcements (300-500 words)
- `/src/blog/posts/facts/` - Industry insights and data (600-1000 words)
- `/src/blog/posts/` - SEO-focused landing pages (1000-2000 words)

File naming convention: `url-friendly-slug.mdx`

### 2. Required Frontmatter

Every post MUST include this frontmatter:

```yaml
---
title: "Your SEO-Optimized Title (50-60 characters)"
description: "Meta description incorporating keywords (150-160 characters)"
date: "YYYY-MM-DD"
author: "Your Name"
category: "tips" # or "guides", "news", "facts", or omit for landing pages
slug: "url-friendly-slug"
keywords: ["primary keyword", "secondary keyword", "related term"]
image: "/blog-assets/url-friendly-slug.svg"
canonical: "https://your-domain.com/resources/category/url-friendly-slug"
---
```

### 3. SEO Best Practices

#### Keyword Placement
- **Title**: Include primary keyword naturally
- **First paragraph**: Mention primary keyword within first 100 words
- **H2 headings**: Include variations of keywords where natural
- **Throughout content**: Maintain 1-2% keyword density
- **Meta description**: Include primary keyword early

#### Content Structure
- Use descriptive H2 and H3 headings
- Keep paragraphs short (2-3 sentences)
- Use bullet points and numbered lists
- Include a conclusion that summarizes key points
- Include at least one visual in the content, ideally close to the top of the blog to keep content visually interesting; for comparison content, create an HTML table (markdown friendly) using the dark color scheme mentioned in our Style Guide; summarized tables will show the differences described in the article in a simple format for readers.

### 4. Internal Linking

Each post should include:
- 2-3 links to related existing posts
- 1 link to the main app (where relevant)

Link naturally within the content.

### 7. Featured Image Generation

Create an SVG featured image for each post (ensure you vary the background color so that each post has a different look; use our Style Guide for color bases):

1. **File location**: `/public/blog-assets/[slug].svg`
2. **File name**: Must match the slug in frontmatter
3. **Design specifications**:
   - Dimensions: 1200x630px (Open Graph standard)
   - Gradient background (use style guide colors)
   - Blog title centered in white text; MUST be 2 lines, occupying about 60% of the middle of the image; when text goes wider than this, it will be cut off in various aspect ratios
   - Clean, readable font

Follow visual style guide at `/project/style_guide.md`

Example SVG structure:
```svg
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3730a3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#gradient)"/>
  <text x="600" y="315" font-family="Arial, sans-serif" font-size="48" 
        font-weight="bold" fill="white" text-anchor="middle">
    Your Blog Title Here
  </text>
</svg>
```

### 8. Content Categories Guide

#### Tips (500-800 words)
- Quick, actionable advice for content creators
- Single concept focus (e.g., "How to Write Better Headlines")
- Clear takeaway for readers

#### Guides (1500-2500 words)
- Comprehensive tutorials on content management
- Multiple sections with H2 headings
- Step-by-step instructions
- Include examples and common mistakes

#### News (300-500 words)
- Platform updates and new features
- Industry announcements
- Community highlights

#### Facts (600-1000 words)
- Industry insights and data
- List-based content (Top 10s, comparisons, etc.)
- Market research and trends
- Engaging, shareable content

#### Landing Pages (1000-2000 words)
- SEO-focused comparison/overview pages
- No category in URL structure
- Comprehensive coverage of topic
- Multiple H2 sections targeting different keywords

### 9. Writing Checklist

Before finalizing each post:

- [ ] Frontmatter complete with all required fields
- [ ] Title is 50-60 characters with primary keyword
- [ ] Meta description is 150-160 characters
- [ ] Primary keyword appears in first paragraph
- [ ] 2-3 internal links to related posts
- [ ] 1 strategic link to your main product/service
- [ ] Headers use keywords naturally
- [ ] Word count appropriate for category
- [ ] Featured image SVG created and saved
- [ ] Conclusion summarizes key points
- [ ] Proofread for grammar and clarity

### 10. Example Post Structure

```mdx
---
title: "Content Marketing Strategy: Complete Guide for 2024"
description: "Master content marketing with proven strategies, tools, and frameworks to grow your audience and drive conversions."
date: "2024-01-15"
author: "Content Team"
category: "guides"
slug: "content-marketing-strategy-guide"
keywords: ["content marketing", "content strategy", "digital marketing", "content planning"]
image: "/blog-assets/content-marketing-strategy-guide.svg"
canonical: "https://your-domain.com/resources/guides/content-marketing-strategy-guide"
---

# Content Marketing Strategy: Complete Guide for 2024

Content marketing has become the cornerstone of successful digital marketing strategies. In this comprehensive guide, we'll explore proven frameworks, tools, and tactics that top brands use to create compelling content that drives real business results.

## What is Content Marketing Strategy?

A content marketing strategy is a systematic approach to creating, distributing, and managing content that attracts and engages your target audience. Unlike traditional advertising, effective content marketing provides genuine value while subtly guiding prospects through your sales funnel.

## Essential Components of Content Strategy

| Component | Description | Impact |
|-----------|-------------|---------|
| Audience Research | Understanding your ideal customer profile | High |
| Content Audit | Analyzing existing content performance | Medium |
| Editorial Calendar | Planning content creation and distribution | High |
| Performance Metrics | Measuring content effectiveness | High |

## Building Your Content Framework

[Content continues with actionable strategies...]

Looking to implement these strategies with a robust content management system? [Explore our AI CMS platform](/) designed specifically for content-driven businesses.

## Conclusion

Successful content marketing requires strategic planning, consistent execution, and continuous optimization. By implementing the frameworks outlined in this guide, you'll be well-positioned to create content that not only engages your audience but drives measurable business growth.
```

### 11. Batch Content Creation

When creating multiple posts:
1. Create all MDX files first
2. Generate all featured images
3. Verify internal links work
4. Check that slugs match across files and images
5. Test each post renders correctly

Remember: Quality over quantity. Each post should provide genuine value to readers.

## Style and Tone

**Important**: Before writing any content, always refer to `/project/writing_guide.md` for:
- Ideal Customer Profile (ICP) details
- Target audience personas
- Brand voice and writing style guidelines
- Tone and messaging consistency requirements

This ensures all content aligns with your brand positioning and resonates with your target audience.

## Common Issues to Avoid

1. **Broken Links**: Always verify internal links work
2. **Missing Images**: Ensure SVG filename matches slug exactly
3. **Keyword Stuffing**: Keep keyword usage natural
4. **Thin Content**: Meet minimum word counts with valuable content
5. **Missing Metadata**: All frontmatter fields are required

## Questions?

If you encounter issues or need clarification:
1. Check existing posts for examples
2. Refer to the blog architecture documentation
3. Ensure you're following the style guide
4. Test your content locally before finalizing

