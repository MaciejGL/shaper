import { Loader2, MessageSquare } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

import { Message } from './message'
import type { MessagesAreaProps } from './types'
import { shouldGroupWithPrevious } from './utils'

export function MessagesArea({
  messages,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  currentUserId,
  partnerName,
  editingMessageId,
  editContent,
  onEditMessage,
  onDeleteMessage,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
  onLoadMoreMessages,
}: MessagesAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const previousMessageCount = useRef<number>(0)
  const firstMessageId = useRef<string | null>(null)
  const hasInitiallyScrolled = useRef<boolean>(false)

  // Handle scroll to detect when user scrolls to top
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container || !onLoadMoreMessages) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10
    const isAtTop = scrollTop < 100

    // Update auto-scroll behavior based on scroll position
    setShouldAutoScroll(isAtBottom)

    // Load more messages when scrolling near the top
    if (isAtTop && hasNextPage && !isFetchingNextPage) {
      onLoadMoreMessages()
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMoreMessages])

  // Attach scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Handle scroll position restoration when older messages are loaded
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container || isLoading) return // Skip during loading to avoid conflicts

    const currentMessageCount = messages.length
    const previousCount = previousMessageCount.current
    const currentFirstMessageId = messages[0]?.id || null
    const previousFirstMessageId = firstMessageId.current

    // Only restore scroll position when older messages are loaded (first message ID changes)
    // Skip during initial load to prevent conflicts with auto-scroll
    if (
      currentMessageCount > previousCount &&
      previousCount > 0 &&
      currentFirstMessageId !== previousFirstMessageId &&
      previousFirstMessageId !== null &&
      hasInitiallyScrolled.current // Only run after initial scroll is complete
    ) {
      const messagesAdded = currentMessageCount - previousCount
      // Find the message that was previously at the top to maintain scroll position
      const messageElements = container.querySelectorAll('[data-message-id]')
      if (messageElements[messagesAdded]) {
        messageElements[messagesAdded].scrollIntoView({ block: 'start' })
      }
    }

    previousMessageCount.current = currentMessageCount
    firstMessageId.current = currentFirstMessageId
  }, [messages, isLoading])

  // Auto-scroll to bottom when new messages arrive (only if user is at bottom)
  useEffect(() => {
    if (shouldAutoScroll) {
      const isInitialLoad = !hasInitiallyScrolled.current && messages.length > 0

      if (isInitialLoad) {
        // For initial load, use setTimeout to ensure it runs after other effects
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: 'auto',
          })
        }, 0)
        hasInitiallyScrolled.current = true
      } else {
        // For subsequent scrolls, use smooth behavior
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
        })
      }
    }
  }, [messages, shouldAutoScroll])

  // Reset initial scroll flag when loading starts (modal reopens)
  useEffect(() => {
    if (isLoading) {
      hasInitiallyScrolled.current = false
      previousMessageCount.current = 0
      firstMessageId.current = null
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center py-8">
        <div className="space-y-2">
          <MessageSquare className="size-12 mx-auto text-muted-foreground" />
          <h3 className="font-medium">Start the conversation</h3>
          <p className="text-sm text-muted-foreground">
            Send a message to {partnerName} to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto px-4 py-2 space-y-1 hide-scrollbar"
    >
      {/* Loading indicator for fetching older messages */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading older messages...
          </div>
        </div>
      )}

      {messages.map((message, index) => {
        const isOwnMessage = message.sender.id === currentUserId
        const previousMessage = index > 0 ? messages[index - 1] : undefined
        const isGrouped = shouldGroupWithPrevious(message, previousMessage)

        return (
          <div key={message.id} data-message-id={message.id}>
            <Message
              message={message}
              isOwnMessage={isOwnMessage}
              isGrouped={isGrouped}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
              editingMessageId={editingMessageId}
              editContent={editContent}
              onEditContentChange={onEditContentChange}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
            />
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
