/**
 * Date formatting utilities for blog posts
 */

/**
 * Format a date string for display in blog posts
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString // Return original if invalid
    }
    
    // Format as "Jan 15, 2024"
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString // Return original if parsing fails
  }
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 1) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return months === 1 ? '1 month ago' : `${months} months ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return years === 1 ? '1 year ago' : `${years} years ago`
    }
  } catch {
    return formatDate(dateString)
  }
}

/**
 * Check if a date is recent (within last 7 days)
 */
export function isRecent(dateString: string): boolean {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    
    return diffDays <= 7
  } catch {
    return false
  }
}