'use client'

import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  LogInIcon,
  LogOutIcon,
  MessageSquare,
  Settings,
  Settings2Icon,
  UserRoundCogIcon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { CLIENT_LINKS, TRAINER_LINKS } from '@/constants/user-links'
import { UserContextType, useUser } from '@/context/user-context'
import {
  GQLUserRole,
  useGetTotalUnreadCountQuery,
  useNotificationsQuery,
} from '@/generated/graphql-client'
import { useOpenUrl } from '@/hooks/use-open-url'
import { useScrollVisibility } from '@/hooks/use-scroll-visibility'
import { cn } from '@/lib/utils'
import { UserWithSession } from '@/types/UserWithSession'

import { MessengerModal } from '../messenger-modal/messenger-modal'
import { useMobileApp } from '../mobile-app-bridge'
import { ModeToggle } from '../mode-toggle'
import { SimpleLogo } from '../simple-logo'
import { Button } from '../ui/button'
import { ButtonLink } from '../ui/button-link'
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
function useUnreadMessageCount(user?: UserContextType['user'] | null) {
  const [enableQuery, setEnableQuery] = useState(false)

  useEffect(() => {
    if (user?.id) {
      // Delay the query by 3 seconds to let more critical queries load first
      const timer = setTimeout(() => {
        setEnableQuery(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [user?.id])

  const { data: notifications } = useNotificationsQuery(
    {
      userId: user?.id ?? '',
      skip: 0,
      take: 10,
    },
    {
      enabled: enableQuery && Boolean(user?.id),
      refetchInterval: 6 * 60 * 1000, // 6 minutes
    },
  )

  const { data: totalUnreadCount } = useGetTotalUnreadCountQuery(
    {},
    {
      enabled: enableQuery,
      refetchInterval: 60 * 1000, // Refetch every 60 seconds for real-time updates
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
  const { user: userContext } = useUser()
  const { totalUnreadCount, notifications } = useUnreadMessageCount(userContext)
  const [isMessengerOpen, setIsMessengerOpen] = useState(false)

  const isTrainer = user?.user?.role === GQLUserRole.Trainer

  const linkToDashboard =
    user?.user?.role === 'TRAINER'
      ? TRAINER_LINKS.clients.href
      : CLIENT_LINKS.workout.href
  const isFitspace = pathname.startsWith('/fitspace')

  const showMessenger =
    (user?.user?.role === GQLUserRole.Client && user?.user?.trainerId) ||
    isTrainer

  const isWorkoutPage = pathname.startsWith('/fitspace/workout')

  return (
    <>
      {user && !isTrainer && (
        <motion.div className={cn('h-[60px]', isWorkoutPage && 'bg-sidebar')} />
      )}

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
            'py-3 px-4',
            isFitspace && 'rounded-b-2xl',
          )}
        >
          <div className="flex items-center gap-2">
            {withSidebar && <SidebarTrigger />}
            {isFitspace ? (
              <Link href={linkToDashboard} scroll className="flex items-center">
                <SimpleLogo size={32} />
                <h2 className="text-base font-medium">Hypro</h2>
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            {user ? (
              <NotificationBell
                notifications={notifications}
                user={user?.user}
              />
            ) : (
              <div className="h-[60px]" />
            )}
            {showMessenger && (
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
            {userContext ? (
              <NavbarUser user={userContext} />
            ) : (
              <div className="h-[60px] rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Messenger Modal */}
      {showMessenger && (
        <MessengerModal
          isOpen={isMessengerOpen}
          onClose={() => setIsMessengerOpen(false)}
          partnerId={
            user?.user?.role === GQLUserRole.Client
              ? (user.user.trainerId ?? undefined)
              : undefined
          }
        />
      )}
    </>
  )
}

function NavbarUser({ user }: { user?: UserContextType['user'] | null }) {
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

  if (user?.role === 'TRAINER') {
    return <TrainerNavbar user={user} />
  }

  if (user?.role === 'CLIENT') {
    return <ClientNavbar user={user} />
  }

  return null
}

function TrainerNavbar({ user }: { user?: UserContextType['user'] | null }) {
  const isProduction = process.env.NODE_ENV === 'production'
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    queryClient.clear()
    await signOut({ callbackUrl: '/login', redirect: false })
    window.location.replace('/login')
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
              imageUrl={user?.profile?.avatarUrl}
              firstName={user?.profile?.firstName ?? ''}
              lastName={user?.profile?.lastName ?? ''}
              sex={user?.profile?.sex}
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
              imageUrl={user?.profile?.avatarUrl}
              firstName={user?.profile?.firstName ?? ''}
              lastName={user?.profile?.lastName ?? ''}
              sex={user?.profile?.sex}
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <NavLink
              href={TRAINER_LINKS.profile.href}
              icon={<UserRoundCogIcon className="size-4" />}
              label={TRAINER_LINKS.profile.label}
            />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <NavLink
              href="#"
              onClick={handleLogout}
              icon={<LogOutIcon className="size-4" />}
              label="Logout"
            />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className="flex flex-col gap-2 px-4 py-4">
            <ModeToggle />
            {!isProduction && (
              <Suspense>
                <SwapAccountButton />
              </Suspense>
            )}
          </div>
        </DropdownProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ClientNavbar({ user }: { user?: UserContextType['user'] | null }) {
  const { isNativeApp } = useMobileApp()
  const [isOpen, setIsOpen] = useState(false)
  const isProduction = process.env.NODE_ENV === 'production'
  const queryClient = useQueryClient()

  // Use the hook to properly handle session tokens
  const {
    openUrl: openAccountManagement,
    isLoading: isOpeningAccountManagement,
  } = useOpenUrl({
    errorMessage: 'Failed to open account management',
  })

  const handleLogout = async () => {
    queryClient.clear()
    await signOut({ callbackUrl: '/login', redirect: false })
    window.location.replace('/login')
  }

  const handleOpenAccountManagement = () => {
    openAccountManagement('/account-management')
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
              imageUrl={user?.profile?.avatarUrl}
              firstName={user?.profile?.firstName ?? ''}
              lastName={user?.profile?.lastName ?? ''}
              sex={user?.profile?.sex}
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
              imageUrl={user?.profile?.avatarUrl}
              firstName={user?.profile?.firstName ?? ''}
              lastName={user?.profile?.lastName ?? ''}
              sex={user?.profile?.sex}
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
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
              onClick={handleLogout}
              icon={<LogOutIcon className="size-4" />}
              label="Logout"
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="flex flex-col gap-2 px-4 py-4">
            <ModeToggle />
            {!isProduction && (
              <Suspense>
                <SwapAccountButton />
              </Suspense>
            )}
          </div>
        </DropdownProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LoadingNavbar() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-[60px] rounded-full animate-pulse" />
    </div>
  )
}
