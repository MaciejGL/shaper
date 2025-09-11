import { useState } from 'react'

export function CollapsibleText({
  text,
  maxWords = 30,
}: {
  text?: string | null
  maxWords?: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text) return null

  // Split text into words
  const words = text.split(' ')

  // If text is shorter than max words, show it all
  if (words.length <= maxWords) {
    return <p className="text-sm text-foreground whitespace-pre-wrap">{text}</p>
  }

  // Create truncated and remaining text
  const truncatedText = words.slice(0, maxWords).join(' ')
  const remainingText = words.slice(maxWords).join(' ')

  return (
    <p className="text-sm text-foreground">
      <span className="whitespace-pre-wrap leading-relaxed">
        {truncatedText}
        {!isExpanded && '...'}
        {isExpanded && (
          <span
            className="whitespace-pre-wrap transition-opacity duration-300 ease-in-out"
            style={{ opacity: isExpanded ? 1 : 0 }}
          >
            {' '}
            {remainingText}
          </span>
        )}
      </span>{' '}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium cursor-pointer transition-colors duration-200"
      >
        {isExpanded ? 'Show Less' : 'Read More'}
      </button>
    </p>
  )
}
