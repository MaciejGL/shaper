import { Fragment, type ReactNode } from 'react'

/**
 * Simple markdown parser that converts basic markdown to React elements.
 * Supports:
 * - Headings: # h1, ## h2, ### h3
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Bullet lists: - item or * item
 * - Numbered lists: 1. item
 * - Paragraph breaks (empty lines)
 * No external dependencies required.
 */
export function parseSimpleMarkdown(text: string): ReactNode {
  if (!text) return null

  const lines = text.split('\n')
  const elements: ReactNode[] = []
  let currentBulletList: string[] = []
  let currentNumberedList: string[] = []
  let key = 0

  const flushBulletList = () => {
    if (currentBulletList.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-outside pl-5 space-y-1 my-2">
          {currentBulletList.map((item, i) => (
            <li key={i}>{parseInlineMarkdown(item)}</li>
          ))}
        </ul>,
      )
      currentBulletList = []
    }
  }

  const flushNumberedList = () => {
    if (currentNumberedList.length > 0) {
      elements.push(
        <ol
          key={key++}
          className="list-decimal list-outside pl-5 space-y-1 my-2"
        >
          {currentNumberedList.map((item, i) => (
            <li key={i}>{parseInlineMarkdown(item)}</li>
          ))}
        </ol>,
      )
      currentNumberedList = []
    }
  }

  const flushLists = () => {
    flushBulletList()
    flushNumberedList()
  }

  let consecutiveEmptyLines = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Empty line - flush lists and track consecutive empty lines
    if (trimmedLine === '') {
      flushLists()
      consecutiveEmptyLines++
      // Add a line break for each empty line (preserves intentional spacing)
      if (consecutiveEmptyLines <= 2) {
        elements.push(<br key={key++} />)
      }
      continue
    }

    // Reset empty line counter when we hit content
    consecutiveEmptyLines = 0

    // H1 heading: # text (check ### and ## first)
    if (trimmedLine.startsWith('### ')) {
      flushLists()
      const headingText = trimmedLine.slice(4)
      elements.push(
        <h3 key={key++} className="text-base font-semibold mt-4 mb-2">
          {parseInlineMarkdown(headingText)}
        </h3>,
      )
      continue
    }

    if (trimmedLine.startsWith('## ')) {
      flushLists()
      const headingText = trimmedLine.slice(3)
      elements.push(
        <h2 key={key++} className="text-lg font-semibold mt-4 mb-2">
          {parseInlineMarkdown(headingText)}
        </h2>,
      )
      continue
    }

    if (trimmedLine.startsWith('# ')) {
      flushLists()
      const headingText = trimmedLine.slice(2)
      elements.push(
        <h1 key={key++} className="text-xl font-bold mt-4 mb-2">
          {parseInlineMarkdown(headingText)}
        </h1>,
      )
      continue
    }

    // Bullet list: - item or * item (but not *italic*)
    if (
      trimmedLine.startsWith('- ') ||
      (trimmedLine.startsWith('* ') && trimmedLine.length > 2)
    ) {
      flushNumberedList()
      const listItemText = trimmedLine.slice(2)
      currentBulletList.push(listItemText)
      continue
    }

    // Numbered list: 1. item, 2. item, etc.
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/)
    if (numberedMatch) {
      flushBulletList()
      currentNumberedList.push(numberedMatch[1])
      continue
    }

    // Regular paragraph text
    flushLists()
    elements.push(
      <p key={key++} className="my-1">
        {parseInlineMarkdown(trimmedLine)}
      </p>,
    )
  }

  // Flush any remaining list items
  flushLists()

  return <Fragment>{elements}</Fragment>
}

/**
 * Parses inline markdown (bold, italic) within a line of text.
 * Supports:
 * - **bold** or __bold__
 * - *italic* or _italic_
 */
function parseInlineMarkdown(text: string): ReactNode {
  // Process text through multiple passes for different formatting
  // Order matters: bold first (** before *), then italic

  const tokens: { type: 'text' | 'bold' | 'italic'; content: string }[] = []

  // Combined regex to match bold (**text** or __text__) and italic (*text* or _text_)
  // Bold uses ** or __, italic uses single * or _
  // We need to be careful not to match ** as two *
  const regex = /(\*\*|__)(.+?)\1|(\*|_)(?!\s)(.+?)(?<!\s)\3/g

  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }

    if (match[1]) {
      // Bold match (** or __)
      tokens.push({ type: 'bold', content: match[2] })
    } else if (match[3]) {
      // Italic match (* or _)
      tokens.push({ type: 'italic', content: match[4] })
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.slice(lastIndex) })
  }

  // If no matches found, return original text
  if (tokens.length === 0) {
    return text
  }

  // Convert tokens to React elements
  return (
    <Fragment>
      {tokens.map((token, i) => {
        switch (token.type) {
          case 'bold':
            return <strong key={i}>{token.content}</strong>
          case 'italic':
            return <em key={i}>{token.content}</em>
          default:
            return token.content
        }
      })}
    </Fragment>
  )
}
