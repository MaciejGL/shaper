import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import type { MessageInputProps } from './types'

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
  allowFocus = true,
}: MessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="px-4 py-3 w-full">
      <div className="grid grid-cols-[1fr_auto] gap-2 w-full">
        <Textarea
          id="message-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Aa"
          className="flex-1 min-h-max resize-none"
          autoComplete="off"
          variant="ghost"
          autoFocus={false}
          tabIndex={allowFocus ? 0 : -1}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          iconOnly={<Send className="size-4" />}
        >
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}
