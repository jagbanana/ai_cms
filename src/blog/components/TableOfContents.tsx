import React, { useState, useEffect, useRef } from 'react';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

interface TableOfContentsProps {
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ className = '' }) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract headings from the document
  useEffect(() => {
    const extractHeadings = () => {
      const headingElements = Array.from(
        document.querySelectorAll('article h2, article h3')
      ) as HTMLElement[];

      const headingItems: HeadingItem[] = headingElements.map((element, index) => {
        // Create ID if it doesn't exist
        if (!element.id) {
          const text = element.textContent || '';
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          element.id = id || `heading-${index}`;
        }

        return {
          id: element.id,
          text: element.textContent || '',
          level: parseInt(element.tagName.charAt(1)), // H2 -> 2, H3 -> 3
          element,
        };
      });

      setHeadings(headingItems);
      return headingItems;
    };

    // Wait for MDX content to be fully rendered
    const timer = setTimeout(extractHeadings, 100);
    return () => clearTimeout(timer);
  }, []);

  // Set up intersection observer for active section highlighting
  useEffect(() => {
    if (headings.length === 0) return;

    const observerOptions = {
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      
      if (visibleEntries.length > 0) {
        // Get the first visible heading
        const firstVisible = visibleEntries[0];
        setActiveId(firstVisible.target.id);
      }
    }, observerOptions);

    // Observe all heading elements
    headings.forEach(heading => {
      if (heading.element) {
        observerRef.current?.observe(heading.element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  // Smooth scroll to section
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Don't render if fewer than 3 headings
  if (headings.length < 3) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-chess-dark-secondary border border-chess-dark-border rounded-lg overflow-hidden">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between w-full p-4 text-white hover:bg-chess-dark-tertiary transition-colors"
          aria-expanded={!isCollapsed}
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-white">Table of Contents</span>
            <span className="ml-2 text-sm text-slate-400">({headings.length} sections)</span>
          </div>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        
        {!isCollapsed && (
          <nav className="border-t border-chess-dark-border bg-chess-dark-secondary">
            <div className="p-4">
              <ul className="space-y-1">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className={`block w-full text-left py-2 px-3 rounded transition-colors text-sm ${
                        heading.level === 3 ? 'ml-6' : ''
                      } ${
                        activeId === heading.id
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-slate-300 hover:text-white hover:bg-chess-dark-tertiary'
                      }`}
                      title={heading.text}
                    >
                      <span className="block">
                        {heading.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default TableOfContents;