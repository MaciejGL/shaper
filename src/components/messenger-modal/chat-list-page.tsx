'use client'

import { MessageSquare, MessageSquarePlus, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SUPPORT_ACCOUNT_ID } from '@/lib/support-account'

import { ChatSidebarItem } from './chat-sidebar-item'
import { SupportNewChatDialog } from './support-new-chat-dialog'
import { getUserDisplayName } from './utils'

type ChatListItem = {
  id: string
  trainerId: string
  clientId: string
  trainer: {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    image?: string | null
  }
  client: {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    image?: string | null
  }
  lastMessage?: { id: string; content: string; createdAt: string } | null
  unreadCount: number
}

interface ChatListPageProps {
  chats: ChatListItem[]
  currentUserId?: string
  currentPartnerId?: string
  isLoading: boolean
  onChatSelect: (partnerId: string) => void
  onClose: () => void
}

export function ChatListPage({
  chats,
  currentUserId,
  currentPartnerId,
  isLoading,
  onChatSelect,
  onClose,
}: ChatListPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)

  const isSupport = currentUserId === SUPPORT_ACCOUNT_ID

  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return chats

    return chats.filter((chat) => {
      const partner =
        currentUserId === chat.trainerId ? chat.client : chat.trainer
      const name = getUserDisplayName(partner).toLowerCase()
      const email = partner.email.toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [chats, currentUserId, searchQuery])

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="shadow-lg">
        {isSupport && (
          <SupportNewChatDialog
            open={isNewChatOpen}
            onOpenChange={setIsNewChatOpen}
            onChatSelect={onChatSelect}
          />
        )}

        <div className="flex items-center justify-between p-4">
          <div className="text-lg font-semibold">Messages</div>
          <div className="flex items-center gap-1">
            {isSupport && (
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={() => setIsNewChatOpen(true)}
                iconOnly={<MessageSquarePlus />}
              />
            )}
            <Button variant="ghost" iconOnly={<X />} onClick={onClose} />
          </div>
        </div>

        {chats.length > 10 && (
          <div className="px-4 pb-3">
            <Input
              id="chat-list-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations"
              iconStart={<Search />}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 pt-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3">
                <div className="size-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <MessageSquare className="size-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery.trim()
                ? 'No matching conversations'
                : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="px-2 py-4">
            {filteredChats.map((chat) => {
              const partner =
                currentUserId === chat.trainerId ? chat.client : chat.trainer
              const partnerId =
                currentUserId === chat.trainerId
                  ? chat.clientId
                  : chat.trainerId

              return (
                <ChatSidebarItem
                  key={chat.id}
                  chat={chat}
                  partner={partner}
                  isActive={partnerId === currentPartnerId}
                  isPartnerUnread={chat.unreadCount > 0}
                  onClick={() => onChatSelect(partnerId)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
