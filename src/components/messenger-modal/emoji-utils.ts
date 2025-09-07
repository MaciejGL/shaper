import data from '@emoji-mart/data'

// Type definitions for emoji-mart data
interface EmojiSkin {
  unified: string
  native: string
}

interface EmojiData {
  id: string
  name: string
  keywords: string[]
  skins: EmojiSkin[]
  version: number
  emoticons?: string[]
}

interface EmojiMartData {
  emojis: Record<string, EmojiData>
  categories: unknown
  aliases: Record<string, string>
  sheet: unknown
}

// Build emoji text mapping from emoji-mart data
const buildEmojiMappings = () => {
  const textToEmoji: Record<string, string> = {}
  const emojiData = data as EmojiMartData

  // Process each emoji in the data for shortcodes
  Object.entries(emojiData.emojis).forEach(([id, emoji]) => {
    const native = emoji.skins?.[0]?.native
    if (!native) return

    // Add shortcode mapping (:smile: -> 😊)
    textToEmoji[`:${id}:`] = native

    // Add common aliases for popular emojis
    if (id === 'thumbsup' || id === '+1') {
      textToEmoji[':+1:'] = native
      textToEmoji[':thumbs_up:'] = native
    }
    if (id === 'thumbsdown' || id === '-1') {
      textToEmoji[':-1:'] = native
      textToEmoji[':thumbs_down:'] = native
    }
  })

  // Manually map common emoticons to preferred emojis to avoid conflicts
  const preferredEmoticons: Record<string, string> = {
    // Smileys - use the most common/expected ones
    ':)': '😊', // blush emoji (friendly smile)
    ':-)': '😊',
    '=)': '😊',
    '(:': '😊',
    ':D': '😃', // smiley (big grin)
    ':-D': '😃',
    '=D': '😃',
    xD: '😆', // laughing with eyes closed
    XD: '😆',
    ':P': '😛', // tongue out
    ':-P': '😛',
    '=P': '😛',
    ':p': '😛',
    ':-p': '😛',
    ';)': '😉', // wink
    ';-)': '😉',

    // Sad faces
    ':(': '😞',
    ':-(': '😞',
    '=(': '😞',

    // Other expressions
    ':|': '😐', // neutral
    ':-|': '😐',
    ':/': '😕', // confused
    ':-/': '😕',
    ':o': '😮', // surprised
    ':O': '😮',
    ':-o': '😮',
    ':-O': '😮',

    // Hearts
    '<3': '❤️',
    '</3': '💔',
  }

  // Add the preferred emoticons
  Object.assign(textToEmoji, preferredEmoticons)

  return textToEmoji
}

// Create the emoji mapping from emoji-mart data
export const EMOJI_TEXT_MAP = buildEmojiMappings()

// Create regex pattern for all emoji codes (escape special regex characters)
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Build regex pattern for emoji detection
const createEmojiPattern = () => {
  const patterns = Object.keys(EMOJI_TEXT_MAP)
    .sort((a, b) => b.length - a.length) // Sort by length to match longer patterns first
    .map(escapeRegex)

  return new RegExp(`(${patterns.join('|')})`, 'g')
}

export const EMOJI_PATTERN = createEmojiPattern()

/**
 * Convert emoji text codes to actual emojis in a string
 * @param text - The input text potentially containing emoji codes
 * @returns Text with emoji codes converted to unicode emojis
 */
export function convertEmojiText(text: string): string {
  return text.replace(EMOJI_PATTERN, (match) => EMOJI_TEXT_MAP[match] || match)
}

/**
 * Check if text ends with a potential emoji pattern that should be converted
 * Used for real-time conversion as user types
 * @param text - The input text
 * @returns Object with conversion info if match found
 */
export function checkForEmojiConversion(text: string): {
  shouldConvert: boolean
  convertedText?: string
  originalLength?: number
  newLength?: number
} {
  const patterns = Object.keys(EMOJI_TEXT_MAP).sort(
    (a, b) => b.length - a.length,
  )

  // First check: patterns followed by space (works anywhere in text)
  for (const pattern of patterns) {
    const patternWithSpace = pattern + ' '
    if (text.includes(patternWithSpace)) {
      // Find the last occurrence to convert the most recent one
      const lastIndex = text.lastIndexOf(patternWithSpace)
      const emoji = EMOJI_TEXT_MAP[pattern]
      const beforePattern = text.slice(0, lastIndex)
      const afterPatternAndSpace = text.slice(
        lastIndex + patternWithSpace.length,
      )
      const convertedText = beforePattern + emoji + ' ' + afterPatternAndSpace

      return {
        shouldConvert: true,
        convertedText,
        originalLength: text.length,
        newLength: convertedText.length,
      }
    }
  }

  // Second check: patterns at the end of text (for immediate conversion without space)
  for (const pattern of patterns) {
    if (text.endsWith(pattern)) {
      const shouldConvertNow =
        (pattern.startsWith(':') && pattern.endsWith(':')) || // Complete shortcodes like :smile:
        !pattern.startsWith(':') // Emoticons like :), :D, xD

      if (shouldConvertNow) {
        const emoji = EMOJI_TEXT_MAP[pattern]
        const beforePattern = text.slice(0, -pattern.length)
        const convertedText = beforePattern + emoji

        return {
          shouldConvert: true,
          convertedText,
          originalLength: text.length,
          newLength: convertedText.length,
        }
      }
    }
  }

  return { shouldConvert: false }
}
