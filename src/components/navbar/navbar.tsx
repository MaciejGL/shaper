'use client'

import { motion } from 'framer-motion'
import {
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  MessageSquare,
  NotebookTextIcon,
  Settings,
  Settings2Icon,
  UserRoundCogIcon,
  Users2Icon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { CLIENT_LINKS, TRAINER_LINKS } from '@/constants/user-links'
import {
  GQLUserRole,
  useGetTotalUnreadCountQuery,
  useNotificationsQuery,
} from '@/generated/graphql-client'
import { useScrollVisibility } from '@/hooks/use-scroll-visibility'
import { cn } from '@/lib/utils'
import { UserWithSession } from '@/types/UserWithSession'

import { MessengerModal } from '../messenger-modal/messenger-modal'
import { useMobileApp } from '../mobile-app-bridge'
import { SimpleLogo } from '../simple-logo'
import { Button } from '../ui/button'
import { ButtonLink } from '../ui/button-link'
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
  const [enableQuery, setEnableQuery] = useState(false)

  useEffect(() => {
    if (user?.user?.id) {
      // Delay the query by 3 seconds to let more critical queries load first
      const timer = setTimeout(() => {
        setEnableQuery(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [user?.user?.id])

  const { data: notifications } = useNotificationsQuery(
    {
      userId: user!.user.id!,
      skip: 0,
      take: 10,
    },
    {
      enabled: enableQuery,
      refetchInterval: 100000,
    },
  )

  const { data: totalUnreadCount } = useGetTotalUnreadCountQuery(
    {},
    {
      enabled: enableQuery,
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    },
  )

  return {
    totalUnreadCount: totalUnreadCount?.getTotalUnreadCount || 0,
    notifications: notifications?.notifications,
  }
}

export const Navbar = ({
  user,
  withSidebar,
}: {
  user?: UserWithSession | null
  withSidebar?: boolean
}) => {
  const pathname = usePathname()
  const { isVisible } = useScrollVisibility({ initialVisible: true })
  const { totalUnreadCount, notifications } = useUnreadMessageCount(user)
  const [isMessengerOpen, setIsMessengerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isTrainer = user?.user?.role === GQLUserRole.Trainer

  const linkToDashboard =
    user?.user?.role === 'TRAINER'
      ? TRAINER_LINKS.clients.href
      : CLIENT_LINKS.workout.href
  const isFitspace = pathname.startsWith('/fitspace')

  return (
    <>
      {user && !isTrainer && <motion.div className="h-[60px]" />}

      <div
        className={!isTrainer ? 'z-10 fixed top-0 left-0 right-0' : 'relative'}
      >
        <div
          data-visible={isVisible}
          className={cn(
            'py-3 px-4 flex justify-between items-center bg-sidebar h-[60px]',
            'data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0',
            'data-[visible=false]:opacity-0 data-[visible=false]:translate-y-[-100px] transition-all duration-200',
            'mt-[var(--safe-area-inset-top)]', // Add safe area padding for iOS PWA
            isFitspace ? 'py-3 px-4' : 'py-0 px-0',
          )}
        >
          <div className="flex items-center gap-2">
            {withSidebar && <SidebarTrigger />}
            {isFitspace ? (
              <Link href={linkToDashboard} scroll className="flex items-center">
                <SimpleLogo size={32} />
                <h2 className="text-base font-medium">Hypertro</h2>
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <NotificationBell
                notifications={notifications}
                user={user?.user}
              />
            ) : (
              <div className="h-[60px]" />
            )}
            {user?.user?.role === GQLUserRole.Client && user?.user?.trainer && (
              <div className="relative">
                <Button
                  variant="ghost"
                  iconOnly={<MessageSquare />}
                  onClick={() => setIsMessengerOpen(true)}
                  className="rounded-full"
                />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-sky-700 text-white text-[10px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1 font-medium">
                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                  </span>
                )}
              </div>
            )}
            {user ? (
              <NavbarUser user={user} />
            ) : (
              <div className="h-[60px] rounded-full animate-pulse" />
            )}
          </div>
        </div>
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
  const [selectedPartnerId, setSelectedPartnerId] = useState<
    string | undefined
  >(undefined)
  const { totalUnreadCount } = useUnreadMessageCount(user)

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            variant="ghost"
            className="rounded-full"
            iconOnly={<MessageSquare className="size-5" />}
            onClick={() => setIsMessengerOpen(true)}
          />
          {totalUnreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1 font-medium">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
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

      {/* Messenger Modal */}
      <MessengerModal
        isOpen={isMessengerOpen}
        onClose={() => {
          setIsMessengerOpen(false)
          setSelectedPartnerId(undefined)
        }}
        partnerId={selectedPartnerId}
        onPartnerChange={setSelectedPartnerId}
      />
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
