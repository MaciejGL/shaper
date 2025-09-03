'use client'

import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserAvatar } from '@/components/user-avatar'
import { useUser } from '@/context/user-context'

import { ChatSidebar } from './chat-sidebar'
import { useMessengerData } from './data'
import { MessageInput } from './message-input'
import { MessagesArea } from './messages-area'
import type { MessengerModalProps } from './types'
import { getUserDisplayName } from './utils'

export function MessengerModal({
  isOpen,
  onClose,
  partnerId,
  onPartnerChange,
}: MessengerModalProps) {
  const [newMessage, setNewMessage] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [allowInputFocus, setAllowInputFocus] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false)

  const { user } = useUser()

  const {
    chat,
    allChats,
    messages,
    partner,
    currentUserId,
    isLoading,
    isSending,
    isFetchingNextPage,
    hasNextPage,
    sendMessage,
    editMessage,
    deleteMessage,
    markMessagesAsRead,
    resetReadStatus,
    selectChat,
    loadMoreMessages,
  } = useMessengerData(partnerId, isOpen)

  // Get partner display info
  const partnerName = partner ? getUserDisplayName(partner) : 'User'
  const partnerAvatar = partner?.image || undefined

  // Mark messages as read when modal opens
  useEffect(() => {
    if (isOpen && chat) {
      markMessagesAsRead()
    }

    // Reset when modal closes
    if (!isOpen) {
      resetReadStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chat?.id]) // Only depend on primitive values to prevent infinite rerenders

  // Manage input focus prevention when modal opens
  useEffect(() => {
    if (isOpen) {
      setAllowInputFocus(false)
      const timer = setTimeout(() => setAllowInputFocus(true), 100)
      return () => clearTimeout(timer)
    } else {
      setAllowInputFocus(false)
    }
  }, [isOpen])

  // Manage sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    // Set initial state
    if (isOpen) {
      handleResize()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  // Message handlers
  const handleSendMessage = () => {
    sendMessage(newMessage)
    setNewMessage('')
    // Trigger scroll to bottom after sending
    setShouldScrollToBottom(true)
    // Reset the flag after a brief delay to allow for re-triggering
    setTimeout(() => setShouldScrollToBottom(false), 100)
  }

  const handleEditMessage = (message: (typeof messages)[0]) => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
  }

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingMessageId) return
    editMessage(editingMessageId, editContent)
    setEditingMessageId(null)
    setEditContent('')
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditContent('')
  }

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId)
  }

  const handleChatSelect = (newPartnerId: string) => {
    // Find the chat ID for the selected partner
    const selectedChatForPartner = allChats.find(
      (chat) =>
        (chat.trainerId === user?.id && chat.clientId === newPartnerId) ||
        (chat.clientId === user?.id && chat.trainerId === newPartnerId),
    )

    if (selectedChatForPartner) {
      selectChat(selectedChatForPartner.id)
    }

    if (onPartnerChange) {
      onPartnerChange(newPartnerId)
    }
    setIsSidebarOpen(false) // Close sidebar on mobile after selection
  }

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        dialogTitle={`Message ${partnerName}`}
        fullScreen={true}
        className="lg:max-w-[1200px] h-dvh lg:h-[80vh] lg:rounded-2xl grid grid-cols-1 lg:grid-cols-[auto_1fr] !p-0 gap-0"
        withCloseButton={false}
      >
        {/* Chat Sidebar */}
        <ChatSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPartnerId={partnerId}
          onChatSelect={handleChatSelect}
          currentUserId={user?.id}
          chats={allChats}
          isLoading={isLoading}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSidebarToggle}
                className="lg:hidden"
              >
                <Menu className="size-4" />
              </Button>
              <UserAvatar
                withFallbackAvatar
                firstName={partner?.firstName || ''}
                lastName={partner?.lastName || ''}
                imageUrl={partnerAvatar}
                className="size-8"
              />
              <div>
                <DialogTitle className="text-base font-medium">
                  {partnerName}
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                iconOnly={<X />}
                className="ml-auto"
              />
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <div className="flex-1 min-h-0">
            <MessagesArea
              messages={messages}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              currentUserId={currentUserId}
              partnerName={partnerName}
              editingMessageId={editingMessageId}
              editContent={editContent}
              shouldScrollToBottom={shouldScrollToBottom}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onEditContentChange={setEditContent}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onLoadMoreMessages={loadMoreMessages}
            />
          </div>

          {/* Message Input */}
          <MessageInput
            value={newMessage}
            onChange={setNewMessage}
            onSend={handleSendMessage}
            disabled={isSending}
            allowFocus={allowInputFocus}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
