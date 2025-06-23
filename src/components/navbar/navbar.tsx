'use client'

import {
  LayoutDashboardIcon,
  LayoutListIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  NotebookTextIcon,
  UserRoundCogIcon,
  Users2Icon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { CLIENT_LINKS, TRAINER_LINKS } from '@/constants/user-links'
import { useNotificationsQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { UserWithSession } from '@/types/UserWithSession'

import { AnimatedLogo, AnimatedLogoText } from '../animated-logo'
import { ModeToggle } from '../mode-toggle'
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

import { NavLink } from './nav-link'
import { NotificationBell } from './notification-bell'
import { SwapAccountButton } from './swap-account'

export const Navbar = ({
  user,
  withSidebar,
}: {
  user?: UserWithSession | null
  withSidebar?: boolean
}) => {
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
  const linkToDashboard =
    user?.user?.role === 'TRAINER'
      ? TRAINER_LINKS.dashboard.href
      : CLIENT_LINKS.dashboard.href

  return (
    <div
      className={cn(
        'py-3 px-4 flex justify-between items-center bg-transparent',
      )}
    >
      <div className="flex items-center gap-2">
        {withSidebar && <SidebarTrigger />}
        <Link href={linkToDashboard}>
          <div className="flex items-center">
            <AnimatedLogo infinite={false} size={32} />
            <AnimatedLogoText />
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <NotificationBell
            notifications={notifications?.notifications}
            user={user?.user}
          />
        )}
        <NavbarUser user={user} />
      </div>
    </div>
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
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="ghost" iconOnly={<MenuIcon />} />
      </DrawerTrigger>
      <DrawerContent dialogTitle="Trainer Menu">
        <DrawerHeader>
          <ModeToggle />
          <div className="flex flex-col items-center gap-2">
            <UserAvatar
              imageUrl={user?.user.profile?.avatarUrl}
              firstName={user?.user.profile?.firstName ?? ''}
              lastName={user?.user.profile?.lastName ?? ''}
              sex={user?.user.profile?.sex}
            />
            <div>{user?.user.email}</div>
          </div>
        </DrawerHeader>
        <div className="border-b w-full my-4" />
        <div className="flex flex-col gap-2 p-4">
          <NavLink
            href={TRAINER_LINKS.dashboard.href}
            icon={<LayoutDashboardIcon className="h-5 w-5" />}
            label={TRAINER_LINKS.dashboard.label}
          />

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
            onClick={() => signOut()}
            icon={<LogOutIcon className="h-5 w-5" />}
            label="Logout"
          />
        </div>
        <DrawerFooter>
          <SwapAccountButton user={user} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ClientNavbar({ user }: { user?: UserWithSession | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          iconOnly={
            <UserAvatar
              className="size-6"
              imageUrl={user?.user.profile?.avatarUrl}
              firstName={user?.user.profile?.firstName ?? ''}
              lastName={user?.user.profile?.lastName ?? ''}
              sex={user?.user.profile?.sex}
            />
          }
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
            <p className="text-sm text-muted-foreground">{user?.user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <NavLink
            href={CLIENT_LINKS.dashboard.href}
            icon={<LayoutDashboardIcon className="size-4" />}
            label={CLIENT_LINKS.dashboard.label}
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <NavLink
            href={CLIENT_LINKS.myPlans.href}
            icon={<LayoutListIcon className="size-4" />}
            label={CLIENT_LINKS.myPlans.label}
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <NavLink
            href={CLIENT_LINKS.workout.href}
            icon={<NotebookTextIcon className="size-4" />}
            label={CLIENT_LINKS.workout.label}
          />
        </DropdownMenuItem>

        <DropdownMenuItem>
          <NavLink
            href={CLIENT_LINKS.profile.href}
            icon={<UserRoundCogIcon className="size-4" />}
            label={CLIENT_LINKS.profile.label}
          />
        </DropdownMenuItem>

        <DropdownMenuItem>
          <NavLink
            href="#"
            onClick={() => signOut()}
            icon={<LogOutIcon className="size-4" />}
            label="Logout"
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between gap-2 px-1 py-4">
          <ModeToggle />
          <SwapAccountButton user={user} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
