# AI CMS Style Guide

This AI CMS features a sophisticated dark mode design with modern aesthetics optimized for content creation and management workflows.

## Color Palette

### Base Colors (Tailwind Custom Properties)
```css
/* Add to tailwind.config.js */
colors: {
  'cms-dark': {
    'primary': '#161618',    /* Primary Background */
    'secondary': '#1E1E22',  /* Cards/Panels */
    'tertiary': '#27272B',   /* Hover states */
  }
}
```

### Tailwind Color Mappings
- **Primary Background**: `bg-cms-dark-primary` or `bg-[#161618]`
- **Secondary Background**: `bg-cms-dark-secondary` or `bg-[#1E1E22]`
- **Tertiary Background**: `bg-cms-dark-tertiary` or `bg-[#27272B]`

### Accent Colors
- **Primary Action**: `bg-blue-600` (#0066FF equivalent)
- **Secondary Action**: `bg-blue-500` (#3B82F6)
- **Success**: `bg-green-500` (#22C55E)
- **Warning**: `bg-amber-500` (#F59E0B)
- **Error**: `bg-red-500` (#EF4444)
- **Accent Purple**: `bg-purple-600` or `bg-[#8a3ffc]`

### Text Colors
- **Primary Text**: `text-white`
- **Secondary Text**: `text-slate-400`
- **Tertiary Text**: `text-slate-500`

### Content-Specific Colors
- **Published Content**: `bg-green-400/30`
- **Draft Content**: `bg-amber-400/30`
- **Archived Content**: `bg-slate-400/30`
- **Featured Content**: `bg-blue-400/40`
- **Content Highlights**: `bg-purple-400/30`

## Typography

### Font Setup
```css
/* Add to index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* Add to tailwind.config.js */
fontFamily: {
  'sans': ['Inter', 'system-ui', 'sans-serif'],
  'mono': ['JetBrains Mono', 'monospace'],
}
```

### Font Classes
- **Heading 1**: `text-2xl font-semibold leading-tight`
- **Heading 2**: `text-xl font-semibold leading-tight`
- **Heading 3**: `text-base font-semibold leading-tight`
- **Body**: `text-sm leading-relaxed`
- **Small**: `text-xs leading-normal`
- **Tiny**: `text-[11px] leading-tight`

## Layout

### Spacing Scale
- Use Tailwind's default spacing: `space-y-2`, `p-4`, `p-6`, `p-8`, `gap-4`, `gap-6`
- Consistent padding for containers: `p-6` (24px)
- Section spacing: `space-y-8` between major sections

### Container Widths
- **Sidebar**: `w-[280px]`
- **Main Content**: `max-w-7xl mx-auto`
- **Content Editor**: `max-w-4xl`
- **Settings Panel**: `max-w-xl`

## Components

### Cards/Panels
```jsx
<div className="bg-cms-dark-secondary rounded-xl p-6 shadow-lg border border-cms-dark-tertiary">
  {/* Content */}
</div>
```

### Buttons
```jsx
/* Primary Button */
<button className="h-10 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors">
  Primary Action
</button>

/* Secondary Button */
<button className="h-10 px-6 bg-cms-dark-tertiary text-white rounded-lg font-medium hover:bg-zinc-700 active:bg-zinc-800 transition-colors border border-zinc-600">
  Secondary Action
</button>
```

### Input Fields
```jsx
<input className="h-10 px-4 bg-cms-dark-tertiary text-white rounded-lg border border-zinc-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all" />
```

### Content Editor Styling
```jsx
/* Editor Container */
<div className="bg-cms-dark-secondary rounded-lg overflow-hidden shadow-2xl border border-cms-dark-tertiary">
  {/* MDX editor component */}
</div>

/* Content Preview */
<div className="bg-cms-dark-secondary rounded-lg p-6 prose prose-invert max-w-none">
  {/* Rendered content */}
</div>
```

### Progress Indicators
```jsx
/* Progress Bar */
<div className="h-1 bg-cms-dark-tertiary rounded-full overflow-hidden">
  <div className="h-full bg-blue-600 transition-all duration-300" style={{width: '60%'}} />
</div>

/* Content Status */
<div className="flex items-center gap-2">
  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
    <CheckIcon className="w-5 h-5 text-white" />
  </div>
  <span className="text-sm text-slate-400">Published</span>
</div>
```

### Navigation Components
```jsx
/* Sidebar Navigation */
<nav className="w-[280px] bg-cms-dark-secondary h-full p-4">
  <ul className="space-y-1">
    <li>
      <a className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-cms-dark-tertiary transition-colors text-slate-400 hover:text-white">
        <Icon className="w-5 h-5" />
        <span>Menu Item</span>
      </a>
    </li>
  </ul>
</nav>
```

## Interactive States

### Hover Effects
- Background change: `hover:bg-opacity-80` or specific hover colors
- Text color: `hover:text-white` for secondary text
- Scale animation: `hover:scale-[1.02] transition-transform`
- Shadow: `hover:shadow-xl transition-shadow`

### Focus States
```css
focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-cms-dark-primary
```

### Content Interactions
- Draggable elements: `cursor-grab active:cursor-grabbing`
- Clickable content: `cursor-pointer hover:bg-cms-dark-tertiary/50`
- Read-only content: `cursor-default`

## Animations

### Transitions
- Default: `transition-all duration-200`
- Smooth interactions: `transition-all duration-300 ease-in-out`
- Content loading: Custom CSS animations for smooth content transitions

### Loading States
```jsx
/* Pulsing skeleton */
<div className="animate-pulse bg-cms-dark-tertiary rounded-lg h-32"></div>

/* Spinning loader */
<div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
```

## Status Indicators

### Content Status
- **Published**: `bg-green-500/20 border-green-500 text-green-400`
- **Draft**: `bg-amber-500/20 border-amber-500 text-amber-400`
- **Archived**: `bg-slate-500/20 border-slate-500 text-slate-400`
- **Featured**: `bg-blue-500/20 border-blue-500 text-blue-400`

### User Roles
- **Admin**: `bg-purple-500`
- **Editor**: `bg-blue-500`
- **Author**: `bg-green-500`
- **Contributor**: `bg-amber-500`

## Responsive Design

### Breakpoints
- Mobile: Default styles
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)
- Wide: `xl:` prefix (1280px+)

### Content Area Responsiveness
```jsx
<div className="w-full max-w-[90vw] md:max-w-4xl mx-auto">
  {/* Content scales with container */}
</div>
```

## Accessibility

### Focus Management
- Visible focus rings on all interactive elements
- Keyboard navigation support for menus
- Tab navigation for content editing

### ARIA Labels
```jsx
<button aria-label="Save content" className="...">
  <SaveIcon />
</button>
```

### Color Contrast
- Ensure WCAG AA compliance
- Minimum contrast ratio 4.5:1 for normal text
- 3:1 for large text and UI components

## Blog Feature Styling

### Featured Images
- Gradient backgrounds for SVG generation
- Use accent colors from the palette
- Maintain 1200x630px dimensions for social sharing

### Content Categories
- **Tips**: `bg-green-500`
- **Guides**: `bg-blue-500`
- **News**: `bg-purple-500`
- **Facts**: `bg-amber-500`

### Blog Post Elements
```jsx
/* Category Badge */
<span className="inline-block px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
  Guide
</span>

/* Reading Time */
<span className="text-slate-400 text-sm">
  5 min read
</span>
```

## Implementation Notes

1. **Dark Mode Only**: The CMS is designed as dark-mode-first with no light theme toggle needed
2. **Content Focus**: Prioritize readability and content creation workflows
3. **Performance**: Use Tailwind's JIT compiler for optimal CSS bundle size
4. **Custom Utilities**: Add frequently used combinations as custom utilities in Tailwind config
5. **SEO Optimization**: Ensure all interactive elements support proper semantic HTML