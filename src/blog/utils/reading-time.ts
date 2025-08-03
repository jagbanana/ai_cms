/**
 * Reading time configuration optimized for chess blog content
 * Accounts for technical content, code blocks, and chess notation
 */
const READING_TIME_OPTIONS = {
  // Words per minute for regular text (slightly slower for technical content)
  wordsPerMinute: 225,
}

/**
 * Simple browser-compatible reading time calculation
 * Replaces the reading-time package which has Node.js dependencies
 */
function calculateBasicReadingTime(text: string, options = READING_TIME_OPTIONS): {
  text: string
  minutes: number
  time: number
  words: number
} {
  // Count words by splitting on whitespace and filtering empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0)
  const wordCount = words.length
  
  // Calculate time in milliseconds
  const timeMs = Math.ceil((wordCount / options.wordsPerMinute) * 60 * 1000)
  const minutes = Math.ceil(timeMs / 60000)
  
  return {
    text: `${minutes} min read`,
    minutes,
    time: timeMs,
    words: wordCount,
  }
}

/**
 * Chess-specific content adjustments
 * These multipliers account for different types of content being slower to read
 */
const CONTENT_MULTIPLIERS = {
  // Code blocks are slower to read and understand
  codeBlock: 0.5,
  // Chess notation requires more mental processing
  chessNotation: 0.7,
  // Chess positions require visual analysis
  chessPosition: 2.0, // Adds 2 minutes per position
}

/**
 * Calculate reading time for blog post content
 * Handles MDX content with chess-specific adjustments
 */
export function calculateBlogReadingTime(content: string): {
  text: string
  minutes: number
  time: number
  words: number
} {
  // Get basic reading time calculation using our browser-compatible function
  const basicReading = calculateBasicReadingTime(content, READING_TIME_OPTIONS)
  
  // Apply chess-specific adjustments
  const adjustedTime = applyChessContentAdjustments(content, basicReading.time)
  const adjustedMinutes = Math.ceil(adjustedTime / 60000) // Convert ms to minutes
  
  return {
    text: formatReadingTime(adjustedMinutes),
    minutes: adjustedMinutes,
    time: adjustedTime,
    words: basicReading.words,
  }
}

/**
 * Apply adjustments for chess-specific content types
 */
function applyChessContentAdjustments(content: string, baseTimeMs: number): number {
  let adjustedTime = baseTimeMs
  
  // Count code blocks (```...``` or `...`)
  const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length
  const inlineCode = (content.match(/`[^`]+`/g) || []).length
  
  // Count chess positions (<ChessPosition.../> or similar)
  const chessPositions = (content.match(/<ChessPosition[^>]*\/?>|<ChessGame[^>]*\/?>/g) || []).length
  
  // Count chess notation patterns (1.e4, Nf3, etc.)
  const chessNotation = (content.match(/\b\d+\.?\s*[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?\b/g) || []).length
  
  // Apply adjustments
  if (codeBlocks > 0) {
    // Each code block adds 30 seconds reading time
    adjustedTime += codeBlocks * 30000
  }
  
  if (inlineCode > 0) {
    // Each inline code snippet adds 2 seconds
    adjustedTime += inlineCode * 2000
  }
  
  if (chessPositions > 0) {
    // Each chess position adds 2 minutes for visual analysis
    adjustedTime += chessPositions * CONTENT_MULTIPLIERS.chessPosition * 60000
  }
  
  if (chessNotation > 0) {
    // Chess notation slows down reading
    const notationPenalty = Math.min(chessNotation * 5000, 120000) // Max 2 minutes penalty
    adjustedTime += notationPenalty
  }
  
  return adjustedTime
}

/**
 * Format reading time into human-readable text
 */
export function formatReadingTime(minutes: number): string {
  if (minutes <= 0) {
    return '1 min read'
  }
  
  if (minutes === 1) {
    return '1 min read'
  }
  
  // Round to nearest minute for readability
  const roundedMinutes = Math.round(minutes)
  return `${roundedMinutes} min read`
}

/**
 * Extract text content from MDX for reading time calculation
 * Removes JSX components and focuses on readable text
 */
export function extractTextFromMDX(mdxContent: string): string {
  let textContent = mdxContent
  
  // Remove frontmatter
  textContent = textContent.replace(/^---[\s\S]*?---/, '')
  
  // Remove JSX components but keep their text content where appropriate
  // Remove self-closing components like <ChessPosition />
  textContent = textContent.replace(/<[A-Z][a-zA-Z0-9]*[^>]*\/>/g, '')
  
  // Remove opening/closing JSX tags but keep content
  textContent = textContent.replace(/<\/?[A-Z][a-zA-Z0-9]*[^>]*>/g, '')
  
  // Remove HTML comments
  textContent = textContent.replace(/<!--[\s\S]*?-->/g, '')
  
  // Remove code blocks for separate processing
  const codeBlocks: string[] = []
  textContent = textContent.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match)
    return ' [CODE_BLOCK] '
  })
  
  // Clean up extra whitespace
  textContent = textContent.replace(/\s+/g, ' ').trim()
  
  return textContent
}

/**
 * Estimate reading time from frontmatter when full content isn't available
 * Fallback method for when we can't access the full MDX content
 */
export function estimateReadingTimeFromFrontmatter(frontmatter: {
  title?: string
  description?: string
  keywords?: string[]
}): number {
  // Combine available text
  const textContent = [
    frontmatter.title || '',
    frontmatter.description || '',
    ...(frontmatter.keywords || [])
  ].join(' ')
  
  // Basic calculation
  const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length
  const wordsPerMinute = READING_TIME_OPTIONS.wordsPerMinute
  const estimatedMinutes = Math.ceil(wordCount / wordsPerMinute)
  
  // Add baseline for typical blog post content (3-5 minutes)
  const baselineMinutes = 4
  
  // Return reasonable estimate between 1-8 minutes
  return Math.max(1, Math.min(estimatedMinutes + baselineMinutes, 8))
}

/**
 * Calculate reading time for a blog post with full content access
 * This is the primary function that should be used during build time
 */
export function calculateFullBlogReadingTime(
  mdxContent: string,
  _frontmatter: { title?: string; description?: string; keywords?: string[] }
): number {
  // Extract readable text from MDX
  const textContent = extractTextFromMDX(mdxContent)
  
  // Calculate reading time with chess adjustments
  const result = calculateBlogReadingTime(textContent)
  
  // Ensure minimum reading time makes sense
  return Math.max(1, result.minutes)
}