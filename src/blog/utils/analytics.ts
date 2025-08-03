/**
 * Blog Analytics Utility
 * Handles Google Analytics 4 integration for the blog system
 */

// Google Analytics global function declaration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Analytics configuration
interface AnalyticsConfig {
  measurementId: string;
  respectDNT: boolean;
  requireConsent: boolean;
}

// Event parameter types (removed unused interfaces)

// Default configuration
const DEFAULT_CONFIG: AnalyticsConfig = {
  measurementId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXXX',
  respectDNT: true,
  requireConsent: false,
};

let isInitialized = false;
let config: AnalyticsConfig = DEFAULT_CONFIG;

/**
 * Check if analytics should be disabled based on privacy preferences
 */
function shouldDisableAnalytics(): boolean {
  // Check Do Not Track header
  if (config.respectDNT && navigator.doNotTrack === '1') {
    return true;
  }

  // Check if consent is required and not given
  if (config.requireConsent) {
    const consent = localStorage.getItem('analytics_consent');
    return consent !== 'granted';
  }

  return false;
}

/**
 * Initialize Google Analytics 4
 * @param measurementId - GA4 measurement ID
 * @param options - Configuration options
 */
export function initializeGA(measurementId: string, options: Partial<AnalyticsConfig> = {}): void {
  config = { ...DEFAULT_CONFIG, ...options, measurementId };

  if (shouldDisableAnalytics()) {
    console.log('Analytics disabled due to privacy preferences');
    return;
  }

  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];

  // Define gtag function
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }

  window.gtag = gtag;

  // Initialize GA4
  gtag('js', new Date());
  gtag('config', measurementId, {
    // Privacy-friendly defaults
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    // Page view will be tracked manually
    send_page_view: false,
  });

  isInitialized = true;
  console.log('Google Analytics initialized:', measurementId);
}

/**
 * Track page view
 * @param path - Page path
 * @param title - Page title
 */
export function trackPageView(path: string, title: string): void {
  if (!isInitialized || shouldDisableAnalytics()) return;

  window.gtag('config', config.measurementId, {
    page_path: path,
    page_title: title,
  });

  console.log('Page view tracked:', { path, title });
}

/**
 * Track custom event
 * @param eventName - Event name
 * @param parameters - Event parameters
 */
export function trackEvent(eventName: string, parameters: Record<string, any> = {}): void {
  if (!isInitialized || shouldDisableAnalytics()) return;

  // Sanitize parameters to avoid PII
  const sanitizedParams = sanitizeParameters(parameters);

  window.gtag('event', eventName, sanitizedParams);
  console.log('Event tracked:', eventName, sanitizedParams);
}

/**
 * Track resource engagement (blog post interactions)
 * @param action - The action taken
 * @param resourceData - Resource metadata
 */
export function trackResourceEngagement(action: string, resourceData: Record<string, any>): void {
  if (!isInitialized || shouldDisableAnalytics()) return;

  const sanitizedData = sanitizeParameters(resourceData);
  
  window.gtag('event', 'resource_engagement', {
    action,
    ...sanitizedData,
  });

  console.log('Resource engagement tracked:', action, sanitizedData);
}

/**
 * Track blog post view
 * @param title - Post title
 * @param category - Post category
 * @param readingTime - Estimated reading time in minutes
 */
export function trackResourceView(title: string, category: string, readingTime: number): void {
  trackEvent('resource_view', {
    resource_title: title,
    resource_category: category,
    reading_time: readingTime,
  });
}

/**
 * Track scroll progress
 * @param title - Post title
 * @param percentage - Scroll percentage (25, 50, 75, 100)
 */
export function trackResourceScroll(title: string, percentage: number): void {
  trackEvent('resource_scroll', {
    resource_title: title,
    scroll_percentage: percentage,
  });
}

/**
 * Track search usage
 * @param searchTerm - Search query
 * @param resultsCount - Number of results
 */
export function trackResourceSearch(searchTerm: string, resultsCount: number): void {
  trackEvent('resource_search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

/**
 * Track CTA clicks
 * @param ctaName - Name/identifier of the CTA
 * @param resourceContext - Context where CTA was clicked
 */
export function trackCTAClick(ctaName: string, resourceContext: string): void {
  trackEvent('cta_click', {
    cta_name: ctaName,
    resource_context: resourceContext,
  });
}

/**
 * Track social sharing
 * @param platform - Social platform (twitter, facebook, etc.)
 * @param resourceTitle - Title of shared resource
 */
export function trackShareClick(platform: string, resourceTitle: string): void {
  trackEvent('share_click', {
    platform,
    resource_title: resourceTitle,
  });
}

/**
 * Track category filter usage
 * @param category - Selected category
 * @param resultsCount - Number of posts in category
 */
export function trackCategoryFilter(category: string, resultsCount: number): void {
  trackEvent('category_filter', {
    category,
    results_count: resultsCount,
  });
}

/**
 * Sanitize parameters to remove potential PII
 * @param params - Raw parameters
 * @returns Sanitized parameters
 */
function sanitizeParameters(params: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    // Skip potential PII fields
    if (isPotentialPII(key)) {
      continue;
    }

    // Sanitize string values
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Check if a parameter key might contain PII
 */
function isPotentialPII(key: string): boolean {
  const piiKeys = ['email', 'name', 'phone', 'address', 'ip', 'user_id', 'session_id'];
  return piiKeys.some(piiKey => key.toLowerCase().includes(piiKey));
}

/**
 * Sanitize string values
 */
function sanitizeString(value: string): string {
  // Remove potential email addresses
  return value.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]');
}

/**
 * Set analytics consent
 * @param granted - Whether consent is granted
 */
export function setAnalyticsConsent(granted: boolean): void {
  localStorage.setItem('analytics_consent', granted ? 'granted' : 'denied');
  
  if (granted && !isInitialized) {
    // Re-initialize if consent was granted
    initializeGA(config.measurementId, config);
  }
}

/**
 * Get current analytics consent status
 */
export function getAnalyticsConsent(): boolean {
  const consent = localStorage.getItem('analytics_consent');
  return consent === 'granted';
}

/**
 * Check if analytics is currently enabled
 */
export function isAnalyticsEnabled(): boolean {
  return isInitialized && !shouldDisableAnalytics();
}

// Hook for React components
export function useAnalytics() {
  return {
    trackPageView,
    trackEvent,
    trackResourceEngagement,
    trackResourceView,
    trackResourceScroll,
    trackResourceSearch,
    trackCTAClick,
    trackShareClick,
    trackCategoryFilter,
    isEnabled: isAnalyticsEnabled(),
  };
}