'use client'

import { useEffect, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserAvatar } from '@/components/user-avatar'

import { useMessengerData } from './data'
import { MessageInput } from './message-input'
import { MessagesArea } from './messages-area'
import type { MessengerModalProps } from './types'
import { getUserDisplayName } from './utils'

export function MessengerModal({
  isOpen,
  onClose,
  partnerId,
}: MessengerModalProps) {
  const [newMessage, setNewMessage] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [allowInputFocus, setAllowInputFocus] = useState(false)

  const {
    chat,
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
    loadMoreMessages,
  } = useMessengerData(partnerId, isOpen)

  // Get partner display info
  const partnerName = partner ? getUserDisplayName(partner) : 'User'
  const partnerAvatar = partner?.profile?.avatarUrl || undefined

  // Mark messages as read when modal opens
  useEffect(() => {
    if (isOpen && chat) {
      markMessagesAsRead()
    }

    // Reset when modal closes
    if (!isOpen) {
      resetReadStatus()
    }
  }, [isOpen, chat, markMessagesAsRead, resetReadStatus])

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

  // Message handlers
  const handleSendMessage = () => {
    sendMessage(newMessage)
    setNewMessage('')
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        dialogTitle={`Message ${partnerName}`}
        fullScreen={true}
        className="lg:max-w-[800px] h-dvh lg:h-[80vh] lg:rounded-2xl flex flex-col p-0 !px-0 gap-0"
      >
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <UserAvatar
              withFallbackAvatar
              firstName={partner?.profile?.firstName || ''}
              lastName={partner?.profile?.lastName || ''}
              imageUrl={partnerAvatar}
              className="size-8"
            />
            <div>
              <DialogTitle className="text-base font-medium">
                {partnerName}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <MessagesArea
          messages={messages}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          currentUserId={currentUserId}
          partnerName={partnerName}
          editingMessageId={editingMessageId}
          editContent={editContent}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onEditContentChange={setEditContent}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onLoadMoreMessages={loadMoreMessages}
        />

        {/* Message Input */}
        <MessageInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={handleSendMessage}
          disabled={isSending}
          allowFocus={allowInputFocus}
        />
      </DialogContent>
    </Dialog>
  )
}
