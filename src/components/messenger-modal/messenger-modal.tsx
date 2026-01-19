'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useUser } from '@/context/user-context'

import { ChatListPage } from './chat-list-page'
import { ChatSidebar } from './chat-sidebar'
import { useMessengerData } from './data'
import { MessageInput } from './message-input'
import { MessagesArea } from './messages-area'
import { MobileChatHeader } from './mobile-chat-header'
import type { MessengerModalProps } from './types'
import { useRealtimeChat } from './use-realtime-chat'
import { getUserDisplayName } from './utils'

type MobileView = 'list' | 'chat'

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
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [mobileView, setMobileView] = useState<MobileView>('list')
  const hasInitializedLayoutRef = useRef(false)

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

  // Get the current partner ID from the selected chat, fallback to prop while loading
  const currentPartnerId = partner?.id || partnerId

  // Get partner display info
  const partnerName = partner ? getUserDisplayName(partner) : 'User'
  const partnerAvatar = partner?.image || undefined

  const { isPartnerTyping, notifyTypingActivity } = useRealtimeChat({
    enabled: isOpen,
    chatId: chat?.id,
    messagesPerChat: 30,
    currentUserId,
  })

  // Mark messages as read when modal opens
  useEffect(() => {
    if (isOpen && chat) {
      markMessagesAsRead()
    }

    // Reset when modal closes
    if (!isOpen) {
      resetReadStatus()
      hasInitializedLayoutRef.current = false
      setMobileView('list')
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

  // Determine layout (mobile vs desktop) for the modal session
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    if (isOpen && !hasInitializedLayoutRef.current) {
      handleResize()
      hasInitializedLayoutRef.current = true
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  // Always start on the chat list on mobile when opening
  useEffect(() => {
    if (!isOpen) return
    if (isDesktop) return
    setMobileView('list')
  }, [isOpen, isDesktop])

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
      if (!isDesktop) {
        setMobileView('chat')
      }
    }

    if (onPartnerChange) {
      onPartnerChange(newPartnerId)
    }
  }

  const handleMobileBack = () => setMobileView('list')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        dialogTitle={`Message ${partnerName}`}
        fullScreen={true}
        className="lg:max-w-[1200px] h-dvh lg:h-[80vh] lg:rounded-2xl p-0!"
        withCloseButton={false}
      >
        {isDesktop ? (
          <div className="h-full grid grid-cols-[auto_1fr] gap-0">
            <ChatSidebar
              isOpen={true}
              onClose={() => {}}
              currentPartnerId={currentPartnerId}
              onChatSelect={handleChatSelect}
              currentUserId={user?.id}
              chats={allChats}
              isLoading={isLoading}
            />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="text-base font-medium truncate">
                  {partnerName}
                </div>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  iconOnly={<X />}
                  className="ml-auto"
                />
              </div>

              <div className="flex-1 min-h-0">
                <MessagesArea
                  messages={messages}
                  isLoading={isLoading}
                  isFetchingNextPage={isFetchingNextPage}
                  hasNextPage={hasNextPage}
                  currentUserId={currentUserId}
                  partnerName={partnerName}
                  typingIndicator={{
                    isTyping: isPartnerTyping,
                    label: `${partnerName} is typing...`,
                  }}
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

              <MessageInput
                value={newMessage}
                onChange={(value) => {
                  setNewMessage(value)
                  notifyTypingActivity(value)
                }}
                onSend={handleSendMessage}
                disabled={isSending}
                allowFocus={allowInputFocus}
              />
            </div>
          </div>
        ) : mobileView === 'list' ? (
          <ChatListPage
            chats={allChats}
            currentUserId={user?.id}
            currentPartnerId={currentPartnerId}
            isLoading={isLoading}
            onChatSelect={handleChatSelect}
            onClose={onClose}
          />
        ) : (
          <div className="flex flex-col h-full overflow-hidden bg-background">
            <div className="shadow-lg">
              <MobileChatHeader
                partnerName={partnerName}
                partnerAvatar={partnerAvatar}
                partner={partner}
                isLoading={isLoading}
                onBack={handleMobileBack}
                onClose={onClose}
              />
            </div>

            <div className="flex-1 min-h-0">
              <MessagesArea
                messages={messages}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                currentUserId={currentUserId}
                partnerName={partnerName}
                typingIndicator={{
                  isTyping: isPartnerTyping,
                  label: `${partnerName} is typing...`,
                }}
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

            <MessageInput
              value={newMessage}
              onChange={(value) => {
                setNewMessage(value)
                notifyTypingActivity(value)
              }}
              onSend={handleSendMessage}
              disabled={isSending}
              allowFocus={allowInputFocus}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
