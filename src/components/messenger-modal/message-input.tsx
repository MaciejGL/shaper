import { SendHorizonal } from 'lucide-react'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from '../ui/dropdown-menu'

// import { EmojiPicker } from './emoji-picker'
import { checkForEmojiConversion } from './emoji-utils'
import type { MessageInputProps } from './types'

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
  allowFocus = true,
}: MessageInputProps) {
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleInputChange = (newValue: string) => {
    // Check for emoji conversion
    const conversion = checkForEmojiConversion(newValue)

    if (conversion.shouldConvert && conversion.convertedText) {
      const textarea = textareaRef.current
      if (textarea) {
        // Calculate cursor position after conversion
        const cursorOffset =
          (conversion.newLength || 0) - (conversion.originalLength || 0)
        const currentPosition = textarea.selectionStart
        const newPosition = currentPosition + cursorOffset

        onChange(conversion.convertedText)

        // Restore cursor position after conversion
        setTimeout(() => {
          textarea.setSelectionRange(newPosition, newPosition)
        }, 0)
      } else {
        onChange(conversion.convertedText)
      }
    } else {
      onChange(newValue)
    }
  }

  // const handleEmojiSelect = (emoji: string) => {
  //   const textarea = textareaRef.current
  //   if (textarea) {
  //     const start = textarea.selectionStart
  //     const end = textarea.selectionEnd
  //     const newValue = value.slice(0, start) + emoji + value.slice(end)
  //     onChange(newValue)

  //     // Restore cursor position after emoji
  //     setTimeout(() => {
  //       const newPosition = start + emoji.length
  //       textarea.setSelectionRange(newPosition, newPosition)
  //       textarea.focus()
  //     }, 0)
  //   } else {
  //     onChange(value + emoji)
  //   }
  //   setShowEmojiPicker(false)
  // }

  return (
    <div className="relative">
      {/* Main input area */}
      <div className="grid grid-cols-[1fr_auto] gap-1 w-full items-center px-4 py-3">
        <Textarea
          ref={textareaRef}
          id="message-input"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Aa"
          className="flex-1 py-2.5 min-h-0 resize-none rounded-4xl max-h-24 focus-visible:ring-0 compact-scrollbar"
          autoComplete="off"
          variant="ghost"
          tabIndex={allowFocus ? 0 : -1}
        />
        {/* <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              className="rounded-full"
              iconOnly={<Smile className="size-5!" />}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-0">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} insideDropdown />
          </DropdownMenuContent>
        </DropdownMenu> */}
        <Button
          onClick={!disabled && value.trim() ? onSend : undefined}
          iconOnly={<SendHorizonal className="size-5!" />}
          size="icon-lg"
          className="rounded-full"
        >
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}
