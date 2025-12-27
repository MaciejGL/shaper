'use client'

import { useQueryClient } from '@tanstack/react-query'
import { LogOutIcon } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

import { ModeToggle } from '@/components/mode-toggle'
import { DropdownProvider, NavLink } from '@/components/navbar/nav-link'
import { SimpleLogo } from '@/components/simple-logo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/user-avatar'
import { useUser } from '@/context/user-context'
import { cn } from '@/lib/utils'

export function MinimalAccountNavbar() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    queryClient.clear()
    await signOut({ callbackUrl: '/login', redirect: false })
    window.location.replace('/login')
  }

  return (
    <div className="relative">
      <div
        className={cn(
          'py-3 px-4 flex justify-between items-center bg-sidebar',
          'mt-[var(--safe-area-inset-top)]',
        )}
      >
        <div className="flex items-center gap-2">
          <SimpleLogo size={32} />
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {user ? (
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full"
                  iconOnly={
                    <UserAvatar
                      className="size-9"
                      withFallbackAvatar
                      imageUrl={user.profile?.avatarUrl}
                      firstName={user.profile?.firstName ?? ''}
                      lastName={user.profile?.lastName ?? ''}
                      sex={user.profile?.sex}
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
                      imageUrl={user.profile?.avatarUrl}
                      firstName={user.profile?.firstName ?? ''}
                      lastName={user.profile?.lastName ?? ''}
                      sex={user.profile?.sex}
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">
                        {user.profile?.firstName} {user.profile?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
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
                  <div className="px-4 py-4">
                    <ModeToggle />
                  </div>
                </DropdownProvider>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="size-9 rounded-full bg-muted animate-pulse" />
          )}
        </div>
      </div>
    </div>
  )
}

