import logger from '../../utils/logger';

// gtag type already declared in analytics.ts

interface BlogErrorEvent {
  error_type: string;
  error_message: string;
  component: string;
  page_path?: string;
  slug?: string;
  category?: string;
}

interface BlogLoadEvent {
  content_type: 'blog_post' | 'category' | 'blog_home';
  content_id: string;
  loading_time?: number;
}

/**
 * Blog-specific analytics utilities
 * Integrates with Google Analytics and ChessLogger
 */
export class BlogAnalytics {
  
  /**
   * Track blog errors in both ChessLogger and Google Analytics
   */
  static trackError(errorEvent: BlogErrorEvent): void {
    // Log to ChessLogger for debugging
    logger.error('BlogAnalytics', `${errorEvent.component}: ${errorEvent.error_message}`, {
      error_type: errorEvent.error_type,
      component: errorEvent.component,
      page_path: errorEvent.page_path,
      slug: errorEvent.slug,
      category: errorEvent.category
    });

    // Track in Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `Blog ${errorEvent.error_type}: ${errorEvent.error_message}`,
        fatal: false,
        custom_map: {
          component: errorEvent.component,
          error_type: errorEvent.error_type,
          page_path: errorEvent.page_path || '',
          blog_category: errorEvent.category || '',
          blog_slug: errorEvent.slug || ''
        }
      });
    }
  }

  /**
   * Track successful blog content loads
   */
  static trackLoad(loadEvent: BlogLoadEvent): void {
    logger.info('BlogAnalytics', 'Content loaded successfully', {
      content_type: loadEvent.content_type,
      content_id: loadEvent.content_id,
      loading_time: loadEvent.loading_time
    });

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'blog_content_load', {
        content_type: loadEvent.content_type,
        content_id: loadEvent.content_id,
        loading_time: loadEvent.loading_time || 0,
        custom_map: {
          blog_content_type: loadEvent.content_type
        }
      });
    }
  }

  /**
   * Track blog search errors
   */
  static trackSearchError(query: string, error: string): void {
    this.trackError({
      error_type: 'search_error',
      error_message: error,
      component: 'BlogSearch',
      page_path: window.location.pathname,
      slug: query
    });
  }

  /**
   * Track image load failures
   */
  static trackImageError(imageSrc: string, alt: string, component: string): void {
    this.trackError({
      error_type: 'image_load_error',
      error_message: `Failed to load image: ${imageSrc}`,
      component,
      page_path: window.location.pathname,
      slug: alt
    });
  }

  /**
   * Track chess position errors
   */
  static trackChessPositionError(fen: string, error: string): void {
    this.trackError({
      error_type: 'chess_position_error',
      error_message: error,
      component: 'ChessPosition',
      page_path: window.location.pathname,
      slug: fen.substring(0, 20) + '...'
    });
  }

  /**
   * Track MDX component errors
   */
  static trackMDXError(component: string, error: string, slug?: string): void {
    this.trackError({
      error_type: 'mdx_component_error',
      error_message: error,
      component: `MDX${component}`,
      page_path: window.location.pathname,
      slug
    });
  }

  /**
   * Track route errors (404s, invalid categories, etc.)
   */
  static trackRouteError(routeType: string, requestedPath: string, error: string): void {
    this.trackError({
      error_type: 'route_error',
      error_message: error,
      component: 'BlogRoutes',
      page_path: requestedPath,
      slug: routeType
    });
  }

  /**
   * Track successful page loads with timing
   */
  static trackPageLoad(pageType: 'blog_home' | 'category' | 'blog_post', identifier: string, loadTime?: number): void {
    this.trackLoad({
      content_type: pageType,
      content_id: identifier,
      loading_time: loadTime
    });
  }

  /**
   * Track puzzle position loading in blog posts
   */
  static trackPuzzlePositionLoad(puzzleId: string, metadata: {
    loadMethod: string;
    contentType: string;
    difficulty: string;
  }): void {
    logger.info('BlogAnalytics', 'Puzzle position loaded', {
      puzzle_id: puzzleId,
      load_method: metadata.loadMethod,
      content_type: metadata.contentType,
      difficulty: metadata.difficulty
    });

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'puzzle_position_load', {
        puzzle_id: puzzleId,
        load_method: metadata.loadMethod,
        content_type: metadata.contentType,
        difficulty: metadata.difficulty,
        custom_map: {
          puzzle_load_method: metadata.loadMethod,
          puzzle_difficulty: metadata.difficulty
        }
      });
    }
  }

  /**
   * Track when users view puzzle solutions
   */
  static trackPuzzleSolutionView(puzzleId: string): void {
    logger.info('BlogAnalytics', 'Puzzle solution viewed', {
      puzzle_id: puzzleId
    });

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'puzzle_solution_view', {
        puzzle_id: puzzleId,
        custom_map: {
          interaction_type: 'solution_view'
        }
      });
    }
  }

  /**
   * Generic event tracking method for custom events
   */
  static trackEvent(eventName: string, parameters: Record<string, any>): void {
    logger.info('BlogAnalytics', `Custom event: ${eventName}`, parameters);

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        custom_map: {
          event_category: 'blog_interaction',
          ...parameters
        }
      });
    }
  }
}

export default BlogAnalytics;