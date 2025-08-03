/**
 * Manual MDX registry for development
 * This file explicitly imports MDX files to work around import.meta.glob issues
 */

// Import Tips posts
import GettingStartedWithAICMS from '../posts/tips/getting-started-with-ai-cms.mdx'

// Import Guides posts
import CompleteCustomizationGuide from '../posts/guides/complete-customization-guide.mdx'

// Import Facts posts
import InterestingCMSFacts from '../posts/facts/interesting-cms-facts.mdx'

export const MDX_REGISTRY = {
  // Tips posts
  '../posts/tips/getting-started-with-ai-cms.mdx': GettingStartedWithAICMS,
  
  // Guides posts
  '../posts/guides/complete-customization-guide.mdx': CompleteCustomizationGuide,
  
  // Facts posts
  '../posts/facts/interesting-cms-facts.mdx': InterestingCMSFacts,
}

export function getRegisteredPosts() {
  return MDX_REGISTRY
}