'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

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
  GQLNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { createScrollUrl } from '@/lib/utils/scroll-to'
import type { UserWithSession } from '@/types/UserWithSession'

import { NotificationItem } from './notification-item'
import { NotificationNavbar } from './types'

interface NotificationBellProps {
  notifications?: NotificationNavbar[]
  user: { id: string } | UserWithSession['user']
}

const useNotifications = (
  notifications: NotificationNavbar[],
  user: { id: string },
) => {
  const [showBadge, setShowBadge] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()
  const { mutateAsync: markNotificationAsRead } =
    useMarkNotificationAsReadMutation()
  const {
    mutateAsync: markAllNotificationsAsRead,
    isPending: isMarkingAllNotificationsAsRead,
  } = useMarkAllNotificationsAsReadMutation()

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (unreadCount > 0 && !isOpen) {
      setShowBadge(true)
    } else {
      setShowBadge(false)
    }
  }, [unreadCount, isOpen])

  const onNotificationClick = async (notification: NotificationNavbar) => {
    await markNotificationAsRead({ id: notification.id })
    queryClient.invalidateQueries({
      queryKey: useNotificationsQuery.getKey({ userId: user.id }),
    })

    // Use notification.link if available (set by backend with proper tabs and params)
    if (notification.link) {
      router.push(notification.link)
      return
    }

    // Fallback handling for notifications without link
    if (
      notification.type === GQLNotificationType.NewTrainingPlanAssigned &&
      notification.relatedItemId
    ) {
      router.push(`/fitspace/my-plans?tab=available`)
    }

    if (notification.type === GQLNotificationType.TrainerNoteShared) {
      router.push(createScrollUrl('/fitspace/my-trainer', 'trainer-notes'))
    }
  }

  const onClearAll = async () => {
    const queryKey = useNotificationsQuery.getKey({ userId: user.id })

    // Optimistically update cache immediately
    await queryClient.cancelQueries({ queryKey })
    const previousData = queryClient.getQueryData(queryKey)

    // Immediately mark all notifications as read in cache
    queryClient.setQueryData(
      queryKey,
      (old: GQLNotificationsQuery | undefined) => {
        if (!old?.notifications) return old
        return {
          ...old,
          notifications: old.notifications.map(
            (notification: GQLNotificationsQuery['notifications'][0]) => ({
              ...notification,
              read: true,
            }),
          ),
        }
      },
    )

    try {
      await markAllNotificationsAsRead({ userId: user.id })
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey })
    } catch (error) {
      // Rollback on error
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData)
      }
      throw error
    }
  }

  return {
    showBadge,
    isOpen,
    setIsOpen,
    unreadCount,
    onNotificationClick,
    onClearAll,
    isMarkingAllNotificationsAsRead,
  }
}

export function NotificationBell({
  notifications = [],
  user,
}: NotificationBellProps) {
  const {
    showBadge,
    isOpen,
    setIsOpen,
    unreadCount,
    onNotificationClick,
    onClearAll,
    isMarkingAllNotificationsAsRead,
  } = useNotifications(notifications, user)

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-md"
            className="relative h-9 w-9 rounded-full"
          >
            <Bell className="size-5 text-sidebar-foreground dark" />
            <AnimatePresence>
              {showBadge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-0 right-0 flex items-center justify-center"
                >
                  <span className="relative flex size-[14px]">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-amber-600 opacity-75 animate-ping [animation-iteration-count:5]"></span>

                    <span className="relative inline-flex rounded-full size-[14px] bg-amber-600 text-white text-[10px] font-medium items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
          <DropdownMenuLabel className="bg-zinc-100 dark:bg-zinc-900 flex items-center justify-between py-3 px-4">
            <span className="font-semibold">Notifications</span>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-normal"
                onClick={onClearAll}
                loading={isMarkingAllNotificationsAsRead}
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
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  No notifications
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <DropdownMenuGroup>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => onNotificationClick(notification)}
                      className="p-0"
                      asChild
                    >
                      <NotificationItem
                        notification={notification}
                        isLast={index === notifications.length - 1}
                      />
                    </DropdownMenuItem>
                  </React.Fragment>
                ))}
              </DropdownMenuGroup>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
