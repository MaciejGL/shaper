'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'

import { TrainingInvitationModal } from '@/components/invitation-modal'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GQLNotificationType,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import type { UserWithSession } from '@/types/UserWithSession'

import { NotificationItem } from './notification-item'
import { NotificationNavbar } from './types'

interface NotificationBellProps {
  notifications?: NotificationNavbar[]
  user: UserWithSession['user']
}

const useNotifications = (
  notifications: NotificationNavbar[],
  user: UserWithSession['user'],
) => {
  const [showBadge, setShowBadge] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutateAsync: markNotificationAsRead } =
    useMarkNotificationAsReadMutation()
  const { mutateAsync: markAllNotificationsAsRead } =
    useMarkAllNotificationsAsReadMutation()

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (unreadCount > 0 && !isOpen) {
      setShowBadge(true)
    } else {
      setShowBadge(false)
    }
  }, [unreadCount, isOpen])

  const onNotificationClick = async (id: string) => {
    await markNotificationAsRead({ id })
    queryClient.invalidateQueries({
      queryKey: useNotificationsQuery.getKey({ userId: user.id }),
    })
  }

  const onClearAll = async () => {
    await markAllNotificationsAsRead({ userId: user.id })
  }

  return {
    showBadge,
    isOpen,
    setIsOpen,
    unreadCount,
    onNotificationClick,
    onClearAll,
  }
}

export function NotificationBell({
  notifications = [],
  user,
}: NotificationBellProps) {
  const [openInvitationId, setOpenInvitationId] = useState<string | null>(null)

  const {
    showBadge,
    isOpen,
    setIsOpen,
    unreadCount,
    onNotificationClick,
    onClearAll,
  } = useNotifications(notifications, user)

  const handleOpenInvitation = (
    notification: NotificationNavbar,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (
      notification.type === GQLNotificationType.CoachingRequest &&
      notification.relatedItemId
    ) {
      e.preventDefault()
      setOpenInvitationId(notification.relatedItemId)
    }
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full"
          >
            <Bell className="size-5" />
            <AnimatePresence>
              {showBadge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 flex items-center justify-center"
                >
                  <span className="relative flex size-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-4 bg-accent text-white text-[10px] font-medium items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
          <DropdownMenuLabel className="bg-zinc-100 dark:bg-zinc-800 flex items-center justify-between py-3 px-4 border-b">
            <span className="font-semibold">Notifications</span>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-normal"
                onClick={onClearAll}
              >
                Clear all
              </Button>
            )}
          </DropdownMenuLabel>

          <div
            className={cn(
              'max-h-[400px] overflow-y-auto',
              notifications.length === 0 && 'py-8',
            )}
          >
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="bg-zinc-200 dark:bg-zinc-700 rounded-full p-3 mb-3">
                  <Bell className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  No notifications
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <DropdownMenuGroup>
                {notifications.map((notification) => (
                  <>
                    <DropdownMenuItem
                      key={notification.id}
                      className="p-0 focus:bg-zinc-200 dark:focus:bg-zinc-700 cursor-pointer"
                      onClick={(e) => {
                        handleOpenInvitation(notification, e)
                        onNotificationClick(notification.id)
                      }}
                    >
                      <NotificationItem notification={notification} />
                    </DropdownMenuItem>
                  </>
                ))}
              </DropdownMenuGroup>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {openInvitationId && (
        <TrainingInvitationModal
          relatedItemId={openInvitationId}
          onClose={() => setOpenInvitationId(null)}
        />
      )}
    </>
  )
}
