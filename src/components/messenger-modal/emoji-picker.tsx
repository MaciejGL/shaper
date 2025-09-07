import data from '@emoji-mart/data'
import PickerComponent from '@emoji-mart/react'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

// Emoji-mart Picker Props based on official documentation
interface EmojiMartPickerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEmojiSelect: (emoji: { native: string; [key: string]: any }) => void
  theme?: 'auto' | 'light' | 'dark'
  previewPosition?: 'none' | 'top' | 'bottom'
  searchPosition?: 'sticky' | 'static' | 'none'
  perLine?: number
  maxFrequentRows?: number
  set?: 'native' | 'apple' | 'facebook' | 'google' | 'twitter'
  skin?: 1 | 2 | 3 | 4 | 5 | 6
  emojiButtonSize?: number
  emojiSize?: number
  autoFocus?: boolean
  navPosition?: 'top' | 'bottom' | 'none'
  noCountryFlags?: boolean
  skinTonePosition?: 'preview' | 'search' | 'none'
  categories?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom?: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  i18n?: any
  onClickOutside?: () => void
}

// Cast the component to have proper types
const Picker = PickerComponent as React.ComponentType<EmojiMartPickerProps>

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose?: () => void
  insideDropdown?: boolean
}

export function EmojiPicker({
  onEmojiSelect,
  onClose,
  insideDropdown = false,
}: EmojiPickerProps) {
  const { theme } = useTheme()
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside - only when NOT inside dropdown
  useEffect(() => {
    if (insideDropdown || !onClose) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose, insideDropdown])

  // Close picker on escape key - only when NOT inside dropdown
  useEffect(() => {
    if (insideDropdown || !onClose) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose, insideDropdown])

  const handleEmojiSelect = (emoji: { native: string }) => {
    onEmojiSelect(emoji.native)
  }

  return (
    <div ref={!insideDropdown ? pickerRef : undefined}>
      <Picker
        data={data}
        onEmojiSelect={handleEmojiSelect}
        theme={theme as 'auto' | 'light' | 'dark'}
        previewPosition="none"
        searchPosition="sticky"
        perLine={8}
        maxFrequentRows={2}
        set="native"
        skin={1}
        emojiButtonSize={32}
        emojiSize={18}
        autoFocus={false}
        navPosition="top"
        skinTonePosition="none"
        onClickOutside={insideDropdown ? undefined : onClose}
      />
    </div>
  )
}
