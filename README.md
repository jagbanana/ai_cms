# AI CMS

**AI-First Content Management System**

The fastest way to build great content for your product. Designed for Jamstack developers and Node.js environments as a powerful alternative to WordPress, Drupal, and other traditional CMS platforms.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jagbanana/ai_cms)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/jagbanana/ai_cms)

## ✨ Features

- **🚀 Lightning Fast**: Built with React 18, Vite, and optimized for performance
- **📝 MDX Content**: Write with Markdown + JSX components for rich, interactive content
- **🎨 Fully Customizable**: Complete control over design, themes, and functionality
- **📱 Mobile-First**: Responsive design that works beautifully on all devices
- **🔍 SEO Optimized**: Built-in SEO, sitemaps, RSS feeds, and structured data
- **🖼️ Image Optimization**: Automatic WebP conversion, responsive images, and lazy loading
- **⚡ No Backend Required**: Static site generation for maximum performance and security
- **🎯 Configurable CTAs**: Environment-driven call-to-action system for conversion optimization
- **📊 Analytics Ready**: Easy integration with Google Analytics, Plausible, and more

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/jagbanana/ai_cms.git
cd ai_cms

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

Your AI CMS will be running at `http://localhost:5174`

## 📖 Documentation

- **[Installation Guide](/src/blog/posts/guides/installation-and-setup.mdx)** - Complete setup and deployment guide
- **[Getting Started](/src/blog/posts/tips/getting-started-with-ai-cms.mdx)** - Learn to create your first content
- **[Customization Guide](/src/blog/posts/guides/complete-customization-guide.mdx)** - Advanced customization and theming

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for lightning-fast development and builds
- **Styling**: Tailwind CSS with Headless UI components
- **Content**: MDX (Markdown + JSX) for rich content authoring
- **State Management**: Zustand for lightweight state management
- **SEO**: React Helmet Async for meta tag management
- **Images**: vite-imagetools for automatic optimization
- **Analytics**: Web Vitals and configurable analytics providers

## 📁 Project Structure

```
src/
├── blog/                 # Blog system
│   ├── components/       # Blog-specific UI components
│   ├── pages/           # Blog pages (home, post, category)
│   ├── posts/           # Your MDX content
│   │   ├── tips/        # Quick tips and advice
│   │   ├── guides/      # Comprehensive tutorials
│   │   ├── facts/       # Interesting insights
│   │   └── news/        # Updates and announcements
│   └── utils/           # Blog utilities and helpers
├── components/          # Shared UI components
├── pages/              # Main application pages
├── utils/              # Helper functions and utilities
└── types/              # TypeScript type definitions
```

## 🎯 Use Cases

### Perfect For:
- **Product Documentation**: Create beautiful docs for your SaaS, API, or tool
- **Marketing Websites**: Build conversion-optimized landing pages and content
- **Developer Blogs**: Technical content with code examples and interactive components
- **Startup Content**: Fast, professional content platform that grows with you
- **Agency Websites**: Customizable foundation for client projects

### Better Than Traditional CMS:
- **No Database**: Eliminates security vulnerabilities and maintenance overhead
- **Version Control**: Content lives in Git alongside your code
- **Developer Friendly**: Built with modern web technologies developers love
- **Performance**: Static generation means blazing fast load times
- **Cost Effective**: Deploy for free on Vercel, Netlify, or any static host

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Site Configuration
VITE_SITE_NAME="Your Site Name"
VITE_SITE_URL="https://your-domain.com"
VITE_SITE_DESCRIPTION="Your site description"

# Analytics (optional)
VITE_GA_TRACKING_ID="G-XXXXXXXXXX"
VITE_PLAUSIBLE_DOMAIN="your-domain.com"

# Call-to-Action Configuration
VITE_CTA_BLOG_POST_HEADING="Your CTA Heading"
VITE_CTA_BLOG_POST_BUTTON_TEXT="Get Started"
VITE_CTA_BLOG_POST_BUTTON_URL="https://github.com/jagbanana/ai_cms"
```

### Content Management

Add new posts by creating MDX files in `/src/blog/posts/`:

```mdx
---
title: "Your Post Title"
description: "SEO-friendly description"
date: 2024-01-20
category: tips
author: "Your Name"
readingTime: 5
---

Your content here with full **Markdown** support and <CustomComponent />!
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically on every push

### Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### GitHub Pages

```bash
npm run build
npm run deploy:github-pages
```

### Custom Server

```bash
npm run build
# Upload dist/ folder to your web server
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Adding Custom Components

1. Create component in `/src/components/`
2. Add to MDX components in `/src/blog/components/MDXComponents/`
3. Use in your MDX content: `<YourComponent />`

### Customizing Design

- **Colors**: Edit `tailwind.config.js`
- **Typography**: Modify Tailwind configuration
- **Layout**: Update components in `/src/components/Layout/`
- **Blog Styling**: Customize `/src/blog/components/`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆚 AI CMS vs. Alternatives

| Feature | AI CMS | WordPress | Drupal | Ghost |
|---------|---------|-----------|--------|-------|
| **Performance** | ⚡ Static Generation | 🐌 Database Queries | 🐌 Heavy Backend | 🟡 Node.js App |
| **Security** | 🔒 No Attack Surface | ⚠️ Frequent Updates Needed | ⚠️ Complex Security | 🟡 Server Maintenance |
| **Developer Experience** | 💻 Modern Stack | 🔧 PHP/Legacy | 🔧 Complex Setup | 🟡 Limited Customization |
| **Hosting Cost** | 💰 Free Static Hosting | 💸 Server + Database | 💸 High Resource Usage | 💸 Node.js Hosting |
| **Content Authoring** | 📝 MDX + Git | 🖥️ Admin Dashboard | 🖥️ Complex Interface | 📝 Clean Editor |
| **Customization** | 🎨 Full Control | 🔌 Plugin Dependent | 🏗️ Module System | 🎨 Theme Limited |

## 🚀 Why Choose AI CMS?

### For Developers
- **Modern Stack**: React, TypeScript, Vite - technologies you already love
- **Git Workflow**: Content versioning alongside code
- **Component Architecture**: Reusable, maintainable code structure
- **Performance**: Static generation for maximum speed

### For Content Creators
- **Simple Authoring**: Write in Markdown with powerful components
- **Live Preview**: See changes instantly during development
- **SEO Built-in**: Optimized for search engines out of the box
- **Mobile Optimized**: Looks great on all devices

### For Businesses
- **Cost Effective**: No server costs, hosting is virtually free
- **Scalable**: Handles any amount of traffic without performance degradation
- **Secure**: No database or server to compromise
- **Fast Time-to-Market**: Launch professional content sites in hours, not weeks

## 💬 Support

- **Documentation**: Check our comprehensive guides in `/src/blog/posts/guides/`
- **Issues**: [GitHub Issues](https://github.com/jagbanana/ai_cms/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jagbanana/ai_cms/discussions)

## 🎉 Getting Started

Ready to build something amazing? 

1. **⭐ Star this repository** to show your support
2. **📖 Read the [Installation Guide](/src/blog/posts/guides/installation-and-setup.mdx)** for detailed setup instructions
3. **🚀 Deploy your first site** using the Vercel or Netlify buttons above
4. **💬 Join our community** and share what you're building!

---

<div align="center">

**Built with ❤️ for the modern web**

[Website](https://ai-cms.dev) • [Documentation](/src/blog/posts/guides/) • [GitHub](https://github.com/jagbanana/ai_cms)

</div>