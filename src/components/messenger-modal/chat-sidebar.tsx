'use client'

import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/user-avatar'
import { useGetMyChatsQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { getUserDisplayName } from './utils'

export interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPartnerId?: string
  onChatSelect: (partnerId: string) => void
  currentUserId?: string
}

export function ChatSidebar({
  isOpen,
  onClose,
  currentPartnerId,
  onChatSelect,
  currentUserId,
}: ChatSidebarProps) {
  const { data: chatsData, isLoading } = useGetMyChatsQuery(
    {},
    {
      staleTime: 60000, // 60 seconds - chat list doesn't change frequently
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
    },
  )
  const chats = useMemo(() => chatsData?.getMyChats || [], [chatsData])

  const handleChatClick = (chat: (typeof chats)[0]) => {
    const partnerId =
      currentUserId === chat.trainerId ? chat.clientId : chat.trainerId
    onChatSelect(partnerId)
    // Save to localStorage for future auto-selection
    localStorage.setItem('lastSelectedPartnerId', partnerId)
  }

  // Auto-select chat when no partner is selected
  useEffect(() => {
    if (!currentPartnerId && chats.length > 0 && !isLoading) {
      // Try to get last selected partner from localStorage
      const lastSelectedPartner = localStorage.getItem('lastSelectedPartnerId')

      let partnerToSelect: string | undefined

      if (lastSelectedPartner) {
        // Check if the last selected partner still has a chat
        const hasLastSelectedChat = chats.some((chat) => {
          const partnerId =
            currentUserId === chat.trainerId ? chat.clientId : chat.trainerId
          return partnerId === lastSelectedPartner
        })

        if (hasLastSelectedChat) {
          partnerToSelect = lastSelectedPartner
        }
      }

      // If no valid last selected partner, get the chat with most recent message
      if (!partnerToSelect) {
        const chatWithMostRecentMessage = chats
          .filter((chat) => chat.lastMessage)
          .sort((a, b) => {
            const dateA = new Date(a.lastMessage!.createdAt).getTime()
            const dateB = new Date(b.lastMessage!.createdAt).getTime()
            return dateB - dateA // Most recent first
          })[0]

        if (chatWithMostRecentMessage) {
          partnerToSelect =
            currentUserId === chatWithMostRecentMessage.trainerId
              ? chatWithMostRecentMessage.clientId
              : chatWithMostRecentMessage.trainerId
        }
      }

      if (partnerToSelect) {
        onChatSelect(partnerToSelect)
      }
    }
  }, [currentPartnerId, chats, isLoading, currentUserId, onChatSelect])

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 lg:hidden',
          isOpen ? 'block' : 'hidden',
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 bg-background border-r border-border flex flex-col',
          'lg:relative lg:z-auto lg:translate-x-0',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <div className="size-10 bg-muted rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center p-4">
              <MessageSquare className="size-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
            </div>
          ) : (
            <div className="p-2">
              {chats.map((chat) => {
                const partner =
                  currentUserId === chat.trainerId ? chat.client : chat.trainer
                const partnerId =
                  currentUserId === chat.trainerId
                    ? chat.clientId
                    : chat.trainerId
                const isActive = partnerId === currentPartnerId
                const hasUnread = chat.unreadCount > 0

                return (
                  <button
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    className={cn(
                      'w-full p-3 text-left rounded-lg transition-colors hover:bg-muted/50',
                      isActive && 'bg-muted',
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <UserAvatar
                          withFallbackAvatar
                          firstName={partner.profile?.firstName || ''}
                          lastName={partner.profile?.lastName || ''}
                          imageUrl={partner.profile?.avatarUrl || undefined}
                          className="size-10"
                        />
                        {hasUnread && (
                          <div className="absolute -top-1 -right-1 size-3 bg-primary rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p
                            className={cn(
                              'text-sm truncate',
                              hasUnread ? 'font-semibold' : 'font-medium',
                            )}
                          >
                            {getUserDisplayName(partner)}
                          </p>
                          {chat.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(chat.lastMessage.createdAt),
                                {
                                  addSuffix: false,
                                },
                              )}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p
                            className={cn(
                              'text-xs text-muted-foreground truncate',
                              hasUnread && 'font-medium text-foreground',
                            )}
                          >
                            {chat.lastMessage.content}
                          </p>
                        )}
                        {hasUnread && (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-medium text-primary">
                              {chat.unreadCount} unread
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  )
}
