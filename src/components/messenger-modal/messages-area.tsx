import { Loader2, MessageSquare } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { ChatLoadingState } from './chat-loading-state'
import { Message } from './message'
import type { MessagesAreaProps } from './types'
import { shouldGroupWithPrevious } from './utils'

const SCROLL_THRESHOLD = 300 // Don't auto-scroll if user scrolled up more than this

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
  const previousScrollHeight = useRef<number>(0)
  const currentChatId = useRef<string | null>(null)
  const initialMessageIds = useRef<Set<string>>(new Set())
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)

  // Check if user is near the bottom of the chat
  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return true

    const { scrollTop, scrollHeight, clientHeight } = container
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    return distanceFromBottom <= SCROLL_THRESHOLD
  }, [])

  // Scroll to bottom helper
  const scrollToBottom = useCallback((instant = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: instant ? 'instant' : 'smooth',
    })
  }, [])

  // Handle scroll to bottom on messages change
  useEffect(() => {
    if (messages.length === 0) return

    const newChatId = messages[0]?.chatId
    const isChatChange = currentChatId.current !== newChatId

    // Always scroll on chat change or initial load
    if (isChatChange) {
      currentChatId.current = newChatId
      // Reset initial load tracking for new chat
      initialMessageIds.current = new Set(messages.map((m) => m.id))
      setIsInitialLoadComplete(false)
      scrollToBottom(true) // Instant scroll for chat changes

      // Mark initial load as complete after a brief delay to prevent animations
      setTimeout(() => setIsInitialLoadComplete(true), 100)
      return
    }

    // For existing chat, mark initial load complete if not already
    if (!isInitialLoadComplete && messages.length > 0) {
      initialMessageIds.current = new Set(messages.map((m) => m.id))
      setIsInitialLoadComplete(true)
    }

    // For new messages in same chat, only scroll if user is near bottom
    if (isNearBottom()) {
      scrollToBottom(false) // Smooth scroll for new messages
    }
    // Only depend on length and chatId to avoid unnecessary re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, messages[0]?.chatId, isInitialLoadComplete])

  // Handle infinite scroll for older messages
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container || !onLoadMoreMessages) return

    const { scrollTop } = container
    const isAtTop = scrollTop < 100

    // Load more messages when scrolling near the top
    if (isAtTop && hasNextPage && !isFetchingNextPage) {
      // Save current scroll position before loading
      previousScrollHeight.current = container.scrollHeight
      onLoadMoreMessages()
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMoreMessages])

  // Maintain scroll position after loading older messages
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container || !isFetchingNextPage) return

    // Restore scroll position after new messages are loaded at the top
    const newScrollHeight = container.scrollHeight
    const heightDifference = newScrollHeight - previousScrollHeight.current

    if (heightDifference > 0) {
      container.scrollTop = heightDifference
    }
  }, [isFetchingNextPage])

  // Attach scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (isLoading) {
    return <ChatLoadingState />
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center py-8">
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
      className="h-full overflow-y-auto px-4 py-2 space-y-1 hide-scrollbar"
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

        // Only animate messages that weren't part of initial load
        const shouldAnimate =
          isInitialLoadComplete && !initialMessageIds.current.has(message.id)

        return (
          <Message
            key={message.id}
            message={message}
            isOwnMessage={isOwnMessage}
            isGrouped={isGrouped}
            shouldAnimate={shouldAnimate}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
            editingMessageId={editingMessageId}
            editContent={editContent}
            onEditContentChange={onEditContentChange}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
          />
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
