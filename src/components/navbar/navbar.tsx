'use client'

import {
  LayoutDashboardIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  NotebookTextIcon,
  UserRoundCogIcon,
  Users2Icon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

import { CLIENT_LINKS, TRAINER_LINKS } from '@/constants/user-links'
import { useNotificationsQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { UserWithSession } from '@/types/UserWithSession'

import { Divider } from '../divider'
import { ModeToggle } from '../mode-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { ButtonLink } from '../ui/button-link'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from '../ui/drawer'
import { SidebarTrigger } from '../ui/sidebar'

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
      refetchInterval: 10000,
    },
  )
  return (
    <div
      className={cn(
        'py-3 px-4 flex justify-between items-center bg-background',
        withSidebar && 'pl-0',
      )}
    >
      {withSidebar && <SidebarTrigger />}
      {!withSidebar && (
        <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text">
          Shaper
        </span>
      )}
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
            <Avatar className="size-20 aspect-square">
              <AvatarImage src="/avatar-male.png" />
              <AvatarFallback>{user?.user.email.slice(0, 2)}</AvatarFallback>
            </Avatar>
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
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="ghost" iconOnly={<MenuIcon />} />
      </DrawerTrigger>
      <DrawerContent dialogTitle="Fitspace Menu">
        <DrawerHeader>
          <Header user={user} />
        </DrawerHeader>
        <Divider />
        <div className="flex flex-col gap-2 p-4">
          <NavLink
            href={CLIENT_LINKS.dashboard.href}
            icon={<LayoutDashboardIcon className="h-5 w-5" />}
            label={CLIENT_LINKS.dashboard.label}
          />
          <NavLink
            href={CLIENT_LINKS.profile.href}
            icon={<UserRoundCogIcon className="h-5 w-5" />}
            label={CLIENT_LINKS.profile.label}
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

function Header({ user }: { user?: UserWithSession | null }) {
  return (
    <>
      <ModeToggle />
      <div className="flex flex-col items-center gap-2">
        <Avatar className="size-20 aspect-square">
          <AvatarImage src="/avatar-male.png" />
          <AvatarFallback>{user?.user.email.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </div>
    </>
  )
}
