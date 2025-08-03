/**
 * Configurable Call-to-Action Component
 * Uses environment variables for content configuration
 */

import React from 'react';
import { getCTAConfig, shouldShowCTA } from '../utils/cta-config';

interface CTASectionProps {
  /** Name of the CTA configuration to use */
  ctaName: string;
  /** Optional custom CSS classes */
  className?: string;
  /** Variant styling */
  variant?: 'default' | 'compact' | 'hero' | 'footer';
  /** Optional click tracking function */
  onButtonClick?: (ctaName: string, buttonUrl: string) => void;
}

export function CTASection({ 
  ctaName, 
  className = '', 
  variant = 'default',
  onButtonClick 
}: CTASectionProps) {
  const config = getCTAConfig(ctaName);
  
  // Don't render if CTA is disabled
  if (!shouldShowCTA(ctaName)) {
    return null;
  }

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(ctaName, config.buttonUrl);
    }
    
    // Handle external vs internal links
    if (config.buttonUrl.startsWith('http')) {
      window.open(config.buttonUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = config.buttonUrl;
    }
  };

  const baseClasses = getVariantClasses(variant);
  
  return (
    <div className={`${baseClasses.container} ${className}`}>
      <div className={baseClasses.content}>
        <h3 className={baseClasses.heading}>
          {config.heading}
        </h3>
        <p className={baseClasses.subheading}>
          {config.subheading}
        </p>
        <button
          onClick={handleButtonClick}
          className={baseClasses.button}
          aria-label={config.buttonText}
        >
          {config.buttonText}
          <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Get CSS classes for different CTA variants
 */
function getVariantClasses(variant: string) {
  const variants = {
    default: {
      container: 'bg-slate-800 rounded-lg p-6 border border-slate-700 text-center',
      content: '',
      heading: 'text-xl font-semibold text-white mb-3',
      subheading: 'text-slate-300 mb-4',
      button: 'inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors'
    },
    compact: {
      container: 'bg-slate-800 rounded p-4 border border-slate-700 text-center',
      content: '',
      heading: 'text-lg font-semibold text-white mb-2',
      subheading: 'text-slate-300 mb-3 text-sm',
      button: 'inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors text-sm'
    },
    hero: {
      container: 'text-center',
      content: 'max-w-2xl mx-auto',
      heading: 'text-3xl md:text-4xl font-bold text-white mb-4',
      subheading: 'text-xl text-slate-300 mb-8',
      button: 'inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg'
    },
    footer: {
      container: 'bg-slate-800 rounded-lg p-6 text-center',
      content: '',
      heading: 'text-lg font-semibold text-white mb-2',
      subheading: 'text-slate-400 mb-4 text-sm',
      button: 'inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors'
    }
  };

  return variants[variant] || variants.default;
}

export default CTASection;