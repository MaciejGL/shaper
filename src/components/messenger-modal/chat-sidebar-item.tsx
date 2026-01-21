'use client'

import { formatDistanceToNow } from 'date-fns'

import { HyproTeamBadge } from '@/components/ui/hypro-team-badge'
import { UserAvatar } from '@/components/user-avatar'
import { SUPPORT_ACCOUNT_ID } from '@/lib/support-account'
import { cn } from '@/lib/utils'

import { getUserDisplayName } from './utils'

interface ChatSidebarItemProps {
  chat: {
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
  isActive: boolean
  isPartnerUnread: boolean
  partner: {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    image?: string | null
  }
  onClick: () => void
}

export function ChatSidebarItem({
  chat,
  isActive,
  isPartnerUnread,
  partner,
  onClick,
}: ChatSidebarItemProps) {
  const isHyproTeam = partner.id === SUPPORT_ACCOUNT_ID

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full p-3 text-left rounded-lg transition-colors hover:bg-muted/50 overflow-hidden cursor-pointer',
        isActive && 'bg-card-on-card',
      )}
    >
      <div className="flex gap-3 min-w-0">
        <div className="relative shrink-0">
          <UserAvatar
            withFallbackAvatar
            firstName={partner.firstName || ''}
            lastName={partner.lastName || ''}
            imageUrl={partner.image || undefined}
            className="size-10"
          />
          {isPartnerUnread && (
            <div className="absolute -top-1 -right-1 size-3 bg-sky-600 rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className={cn(
                  'text-sm truncate min-w-0',
                  isPartnerUnread ? 'font-semibold' : 'font-medium',
                )}
              >
                {getUserDisplayName(partner)}
              </span>
              {isHyproTeam ? <HyproTeamBadge /> : null}
            </div>
            {chat.lastMessage && (
              <span className="text-xs text-muted-foreground shrink-0 ml-2">
                {formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
                  addSuffix: false,
                })}
              </span>
            )}
          </div>
          {chat.lastMessage && (
            <p
              className={cn(
                'text-xs text-muted-foreground truncate min-w-0',
                isPartnerUnread && 'font-medium text-foreground',
              )}
            >
              {chat.lastMessage.content}
            </p>
          )}
          {isPartnerUnread && (
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
}
