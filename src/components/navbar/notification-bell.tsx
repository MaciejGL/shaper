'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

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

import { useMobileApp } from '../mobile-app-bridge'

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
  const router = useRouter()
  const { mutateAsync: markNotificationAsRead } =
    useMarkNotificationAsReadMutation()
  const {
    mutateAsync: markAllNotificationsAsRead,
    isPending: isMarkingAllNotificationsAsRead,
  } = useMarkAllNotificationsAsReadMutation()
  const { isNativeApp } = useMobileApp()

  const handleOpenOffer = (offerUrl: string) => {
    if (isNativeApp) {
      // Force external browser opening for native app
      const opened = window.open(
        offerUrl,
        '_blank',
        'noopener,noreferrer,external=true',
      )

      if (!opened) {
        // Fallback: create link element
        const link = document.createElement('a')
        link.href = offerUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer external'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } else {
      window.open(offerUrl, '_blank', 'noopener,noreferrer')
    }
  }

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

    if (
      notification.type === GQLNotificationType.NewTrainingPlanAssigned &&
      notification.relatedItemId
    ) {
      router.push(`/fitspace/my-plans?tab=available`)
    }

    if (
      notification.type === GQLNotificationType.TrainerOfferReceived &&
      notification.link
    ) {
      handleOpenOffer(notification.link)
    }
  }

  const onClearAll = async () => {
    await markAllNotificationsAsRead(
      { userId: user.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: useNotificationsQuery.getKey({ userId: user.id }),
          })
        },
      },
    )
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
  const [openInvitationId, setOpenInvitationId] = useState<string | null>(null)

  const {
    showBadge,
    isOpen,
    setIsOpen,
    unreadCount,
    onNotificationClick,
    onClearAll,
    isMarkingAllNotificationsAsRead,
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
            size="icon-md"
            className="relative h-9 w-9 rounded-full"
          >
            <Bell className="size-5" />
            <AnimatePresence>
              {showBadge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-0 right-0 flex items-center justify-center"
                >
                  <span className="relative flex size-[14px]">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75 animate-ping [animation-iteration-count:5]"></span>

                    <span className="relative inline-flex rounded-full size-[14px] bg-blue-600 text-white text-[10px] font-medium items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
          <DropdownMenuLabel className="bg-zinc-100 dark:bg-zinc-900 flex items-center justify-between py-3 px-4 border-b">
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
                  <React.Fragment key={notification.id}>
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={(e) => {
                        handleOpenInvitation(notification, e)
                        onNotificationClick(notification)
                      }}
                      className="p-0"
                      asChild
                    >
                      <NotificationItem notification={notification} />
                    </DropdownMenuItem>
                  </React.Fragment>
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
