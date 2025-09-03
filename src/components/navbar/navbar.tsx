'use client'

import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  MessageSquare,
  NotebookTextIcon,
  Settings,
  Settings2Icon,
  SunIcon,
  UserRoundCogIcon,
  Users2Icon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { CLIENT_LINKS, TRAINER_LINKS } from '@/constants/user-links'
import {
  GQLUserRole,
  useGetMyChatsQuery,
  useNotificationsQuery,
} from '@/generated/graphql-client'
import { useScrollVisibility } from '@/hooks/use-scroll-visibility'
import { cn } from '@/lib/utils'
import { UserWithSession } from '@/types/UserWithSession'

import { AnimatedLogo, AnimatedLogoText } from '../animated-logo'
import { MessengerModal } from '../messenger-modal'
import { useMobileApp } from '../mobile-app-bridge'
import { Button } from '../ui/button'
import { ButtonLink } from '../ui/button-link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from '../ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { SidebarTrigger } from '../ui/sidebar'
import { UserAvatar } from '../user-avatar'

import { DropdownProvider, NavLink } from './nav-link'
import { NotificationBell } from './notification-bell'
import { SwapAccountButton } from './swap-account'

// Custom hook to get total unread message count
function useUnreadMessageCount(user?: UserWithSession | null) {
  const { data: chatsData } = useGetMyChatsQuery(
    {},
    {
      enabled: !!user?.user?.id,
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    },
  )

  const unreadCount =
    chatsData?.getMyChats?.reduce(
      (total, chat) => total + (chat.unreadCount || 0),
      0,
    ) || 0

  return unreadCount
}

export const Navbar = ({
  user,
  withSidebar,
}: {
  user?: UserWithSession | null
  withSidebar?: boolean
}) => {
  const [mounted, setMounted] = useState(false)
  const [isMessengerOpen, setIsMessengerOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { isVisible } = useScrollVisibility()
  const unreadCount = useUnreadMessageCount(user)
  const queryClient = useQueryClient()

  // Invalidate unread count when messenger modal opens
  useEffect(() => {
    if (isMessengerOpen) {
      queryClient.invalidateQueries({
        queryKey: useGetMyChatsQuery.getKey({}),
      })
    }
  }, [isMessengerOpen, queryClient])

  useEffect(() => {
    setMounted(true)
  }, [])
  const { data: notifications } = useNotificationsQuery(
    {
      userId: user!.user.id!,
      skip: 0,
      take: 10,
    },
    {
      enabled: !!user?.user?.id,
      refetchInterval: 100000,
    },
  )
  const isTrainer = user?.user?.role === GQLUserRole.Trainer

  const linkToDashboard =
    user?.user?.role === 'TRAINER'
      ? TRAINER_LINKS.clients.href
      : CLIENT_LINKS.workout.href
  const pathname = usePathname()
  const isFitspace = pathname.startsWith('/fitspace')

  return (
    <>
      {user && !isTrainer && (
        <motion.div
          key={isFitspace ? 'fitspace-navbar' : 'default-navbar'}
          className="h-[60px]"
        />
      )}

      <div
        className={!isTrainer ? 'z-10 fixed top-0 left-0 right-0' : 'relative'}
      >
        <motion.div
          key={isFitspace ? 'fitspace' : 'default'}
          initial={
            isFitspace
              ? { opacity: 0, y: 0, height: 60, padding: '12px 16px' }
              : {}
          }
          animate={
            isFitspace
              ? {
                  opacity: isVisible ? 1 : 0,
                  y: isVisible ? 0 : -100,
                  // height: isVisible ? 60 : 0,
                  padding: isVisible ? '12px 16px' : '0px 16px',
                }
              : {}
          }
          transition={{ duration: 0.3 }}
          className={cn(
            'py-3 px-4 flex justify-between items-center bg-sidebar',
            'mt-[var(--safe-area-inset-top)]', // Add safe area padding for iOS PWA
          )}
        >
          <div className="flex items-center gap-2">
            {withSidebar && <SidebarTrigger />}
            {isFitspace ? (
              <Link href={linkToDashboard}>
                <div className="flex items-center">
                  <AnimatedLogo infinite={false} size={32} />
                  <AnimatedLogoText />
                </div>
              </Link>
            ) : null}
          </div>
          {process.env.NODE_ENV === 'development' && mounted && (
            <Button
              variant="ghost"
              iconOnly={<SunIcon />}
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark')
              }}
            />
          )}
          <div className="flex items-center gap-2">
            {user && (
              <NotificationBell
                notifications={notifications?.notifications}
                user={user?.user}
              />
            )}
            {user?.user?.role === GQLUserRole.Client && user?.user?.trainer && (
              <div className="relative">
                <Button
                  variant="ghost"
                  iconOnly={<MessageSquare />}
                  onClick={() => setIsMessengerOpen(true)}
                  className="rounded-full"
                />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-sky-700 text-white text-[10px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1 font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            )}
            <NavbarUser user={user} />
          </div>
        </motion.div>
      </div>

      {/* Messenger Modal for Clients */}
      {user?.user?.role === GQLUserRole.Client && user?.user?.trainer && (
        <MessengerModal
          isOpen={isMessengerOpen}
          onClose={() => setIsMessengerOpen(false)}
          partnerId={user.user.trainer.id}
        />
      )}
    </>
  )
}

function NavbarUser({ user }: { user?: UserWithSession | null }) {
  const pathname = usePathname()
  const isActiveLink = (path: string) => pathname === path

  if (!user && isActiveLink('/login')) {
    return null
  }

  if (!user) {
    return (
      <ButtonLink href="/login">
        <LogInIcon className="w-4 h-4" />
      </ButtonLink>
    )
  }

  if (user?.user?.role === 'TRAINER') {
    return <TrainerNavbar user={user} />
  }

  if (user?.user?.role === 'CLIENT') {
    return <ClientNavbar user={user} />
  }

  return null
}

function TrainerNavbar({ user }: { user?: UserWithSession | null }) {
  const isProduction = process.env.NODE_ENV === 'production'
  const [isMessengerOpen, setIsMessengerOpen] = useState(false)
  const [isChatListOpen, setIsChatListOpen] = useState(false)
  const [selectedChatPartnerId, setSelectedChatPartnerId] = useState<
    string | null
  >(null)
  const unreadCount = useUnreadMessageCount(user)
  const queryClient = useQueryClient()

  // Invalidate unread count when chat list or messenger opens
  useEffect(() => {
    if (isChatListOpen || isMessengerOpen) {
      queryClient.invalidateQueries({
        queryKey: useGetMyChatsQuery.getKey({}),
      })
    }
  }, [isChatListOpen, isMessengerOpen, queryClient])

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            variant="ghost"
            iconOnly={<MessageSquare className="size-5" />}
            onClick={() => setIsChatListOpen(true)}
          />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1 font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button variant="ghost" iconOnly={<MenuIcon />} />
          </DrawerTrigger>
          <DrawerContent dialogTitle="Trainer Menu">
            <DrawerHeader>
              <div className="flex flex-col items-center gap-2">
                <UserAvatar
                  imageUrl={user?.user.profile?.avatarUrl}
                  firstName={user?.user.profile?.firstName ?? ''}
                  lastName={user?.user.profile?.lastName ?? ''}
                  sex={user?.user.profile?.sex}
                  withFallbackAvatar
                />
                <div>{user?.user.email}</div>
              </div>
            </DrawerHeader>
            <div className="border-b w-full my-4" />
            <div className="flex flex-col gap-2 p-4">
              {/* <NavLink
            href={TRAINER_LINKS.clients.href}
            icon={<LayoutDashboardIcon className="h-5 w-5" />}
            label={TRAINER_LINKS.dashboard.label}
          /> */}

              <NavLink
                href={TRAINER_LINKS.clients.href}
                icon={<Users2Icon className="h-5 w-5" />}
                label={TRAINER_LINKS.clients.label}
              />
              <NavLink
                href={TRAINER_LINKS.trainings.href}
                icon={<NotebookTextIcon className="h-5 w-5" />}
                label={TRAINER_LINKS.trainings.label}
              />
            </div>
            <div className="border-b w-full my-4" />
            <div className="flex flex-col gap-2 p-4">
              <NavLink
                href={TRAINER_LINKS.profile.href}
                icon={<UserRoundCogIcon className="h-5 w-5" />}
                label={TRAINER_LINKS.profile.label}
              />
              <NavLink
                href="#"
                onClick={() =>
                  signOut({ callbackUrl: '/login', redirect: true })
                }
                icon={<LogOutIcon className="h-5 w-5" />}
                label="Logout"
              />
            </div>
            {!isProduction && (
              <DrawerFooter>
                <SwapAccountButton />
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      </div>

      {/* Chat List Modal */}
      <TrainerChatListModal
        isOpen={isChatListOpen}
        onClose={() => setIsChatListOpen(false)}
        onSelectChat={(partnerId) => {
          setSelectedChatPartnerId(partnerId)
          setIsChatListOpen(false)
          setIsMessengerOpen(true)
        }}
      />

      {/* Messenger Modal */}
      {selectedChatPartnerId && (
        <MessengerModal
          isOpen={isMessengerOpen}
          onClose={() => {
            setIsMessengerOpen(false)
            setSelectedChatPartnerId(null)
          }}
          partnerId={selectedChatPartnerId}
        />
      )}
    </>
  )
}

function ClientNavbar({ user }: { user?: UserWithSession | null }) {
  const { isNativeApp } = useMobileApp()
  const [isOpen, setIsOpen] = useState(false)
  const isProduction = process.env.NODE_ENV === 'production'

  const handleOpenAccountManagement = () => {
    const accountManagementUrl = `${window.location.origin}/account-management`

    if (isNativeApp) {
      // Force external browser opening for native app
      const opened = window.open(
        accountManagementUrl,
        '_blank',
        'noopener,noreferrer,external=true',
      )

      if (!opened) {
        // Fallback: create link element
        const link = document.createElement('a')
        link.href = accountManagementUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer external'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } else {
      window.open(accountManagementUrl, '_blank', 'noopener,noreferrer')
    }
  }
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full"
          iconOnly={
            <UserAvatar
              className="size-8"
              withFallbackAvatar
              imageUrl={user?.user.profile?.avatarUrl}
              firstName={user?.user.profile?.firstName ?? ''}
              lastName={user?.user.profile?.lastName ?? ''}
              sex={user?.user.profile?.sex}
            />
          }
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownProvider value={{ closeDropdown: () => setIsOpen(false) }}>
          <div className="flex items-center gap-2 p-4">
            <UserAvatar
              className="size-12"
              imageUrl={user?.user.profile?.avatarUrl}
              firstName={user?.user.profile?.firstName ?? ''}
              lastName={user?.user.profile?.lastName ?? ''}
              sex={user?.user.profile?.sex}
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {user?.user.profile?.firstName} {user?.user.profile?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.user.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <NavLink
              href={CLIENT_LINKS.profile.href}
              icon={<UserRoundCogIcon className="size-4" />}
              label={CLIENT_LINKS.profile.label}
            />
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <NavLink
              href={CLIENT_LINKS.settings.href}
              icon={<Settings2Icon className="size-4" />}
              label={CLIENT_LINKS.settings.label}
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <NavLink
              href="#"
              icon={<Settings className="size-4" />}
              label={CLIENT_LINKS.accountManagement.label}
              onClick={handleOpenAccountManagement}
            />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <NavLink
              href="#"
              onClick={() => signOut({ callbackUrl: '/login', redirect: true })}
              icon={<LogOutIcon className="size-4" />}
              label="Logout"
            />
          </DropdownMenuItem>
          {!isProduction && (
            <>
              <DropdownMenuSeparator />
              <div className="flex flex-col gap-2 px-4 py-4">
                <SwapAccountButton />
              </div>
            </>
          )}
        </DropdownProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface TrainerChatListModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectChat: (partnerId: string) => void
}

function TrainerChatListModal({
  isOpen,
  onClose,
  onSelectChat,
}: TrainerChatListModalProps) {
  const queryClient = useQueryClient()

  const { data: chatsData, isLoading } = useGetMyChatsQuery(
    {},
    {
      enabled: isOpen,
      refetchInterval: isOpen ? 30000 : false, // Refetch every 30s when modal is open
    },
  )

  // Invalidate cache when modal opens to refresh unread counts
  useEffect(() => {
    if (isOpen) {
      queryClient.invalidateQueries({
        queryKey: useGetMyChatsQuery.getKey({}),
      })
    }
  }, [isOpen, queryClient])

  const chats = chatsData?.getMyChats || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dialogTitle="Messages" className="max-w-md">
        <DialogHeader>
          <DialogTitle>Messages</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading chats...
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="size-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm">
                Your client conversations will appear here
              </p>
            </div>
          ) : (
            chats.map((chat) => {
              // For trainers, show client info
              const client = chat.client
              const clientName =
                client.profile?.firstName && client.profile?.lastName
                  ? `${client.profile.firstName} ${client.profile.lastName}`
                  : client.name || 'Client'

              return (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(client.id)}
                  className="w-full p-3 rounded-lg border hover:bg-accent text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      className="size-10"
                      imageUrl={client.profile?.avatarUrl}
                      firstName={client.profile?.firstName || ''}
                      lastName={client.profile?.lastName || ''}
                      withFallbackAvatar
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {clientName}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
