/**
 * Call-to-Action Configuration System
 * Allows configuring CTAs via environment variables
 */

export interface CTAConfig {
  heading: string;
  subheading: string;
  buttonText: string;
  buttonUrl: string;
  enabled: boolean;
}

/**
 * Get CTA configuration from environment variables
 */
export function getCTAConfig(ctaName: string): CTAConfig {
  const prefix = `VITE_CTA_${ctaName.toUpperCase()}_`;
  
  return {
    heading: import.meta.env[`${prefix}HEADING`] || getDefaultCTA(ctaName).heading,
    subheading: import.meta.env[`${prefix}SUBHEADING`] || getDefaultCTA(ctaName).subheading,
    buttonText: import.meta.env[`${prefix}BUTTON_TEXT`] || getDefaultCTA(ctaName).buttonText,
    buttonUrl: import.meta.env[`${prefix}BUTTON_URL`] || getDefaultCTA(ctaName).buttonUrl,
    enabled: import.meta.env[`${prefix}ENABLED`] !== 'false', // Default to true unless explicitly disabled
  };
}

/**
 * Default CTA configurations for different contexts
 */
function getDefaultCTA(ctaName: string): CTAConfig {
  const defaults: Record<string, CTAConfig> = {
    'blog-post': {
      heading: 'Ready to Build Your Own CMS?',
      subheading: 'Start creating amazing content with AI CMS. Clone the repository and get started in minutes.',
      buttonText: 'Get Started',
      buttonUrl: 'https://github.com/jagbanana/ai_cms',
      enabled: true,
    },
    'footer-primary': {
      heading: 'Start Your Content Journey',
      subheading: 'Download AI CMS and begin creating professional content today',
      buttonText: 'Download Now',
      buttonUrl: 'https://github.com/jagbanana/ai_cms',
      enabled: true,
    },
    'footer-secondary': {
      heading: 'Explore the Documentation',
      subheading: 'Learn how to customize and deploy your AI CMS',
      buttonText: 'View Docs',
      buttonUrl: '/resources/guides/installation-and-setup',
      enabled: true,
    },
    'home-hero': {
      heading: 'Try AI CMS Today',
      subheading: 'Join thousands of developers building modern content experiences',
      buttonText: 'Get Started Free',
      buttonUrl: 'https://github.com/jagbanana/ai_cms',
      enabled: true,
    },
  };

  return defaults[ctaName] || {
    heading: 'Get Started with AI CMS',
    subheading: 'Build modern content experiences with our AI-powered CMS',
    buttonText: 'Learn More',
    buttonUrl: '/resources',
    enabled: true,
  };
}

/**
 * Check if a CTA should be displayed
 */
export function shouldShowCTA(ctaName: string): boolean {
  return getCTAConfig(ctaName).enabled;
}

/**
 * Get all available CTA names for configuration
 */
export function getAvailableCTAs(): string[] {
  return ['blog-post', 'footer-primary', 'footer-secondary', 'home-hero'];
}

/**
 * Generate environment variable documentation for CTAs
 */
export function generateCTAEnvDocs(): string {
  const ctas = getAvailableCTAs();
  let docs = '# Call-to-Action Configuration\n\n';
  docs += 'Configure CTAs by setting these environment variables:\n\n';
  
  ctas.forEach(cta => {
    const config = getDefaultCTA(cta);
    const prefix = `VITE_CTA_${cta.toUpperCase().replace('-', '_')}_`;
    
    docs += `## ${cta}\n`;
    docs += `- \`${prefix}HEADING\` (default: "${config.heading}")\n`;
    docs += `- \`${prefix}SUBHEADING\` (default: "${config.subheading}")\n`;
    docs += `- \`${prefix}BUTTON_TEXT\` (default: "${config.buttonText}")\n`;
    docs += `- \`${prefix}BUTTON_URL\` (default: "${config.buttonUrl}")\n`;
    docs += `- \`${prefix}ENABLED\` (default: "true")\n\n`;
  });
  
  return docs;
}