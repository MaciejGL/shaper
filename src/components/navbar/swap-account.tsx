'use client'

import { User2 } from 'lucide-react'
import { signIn } from 'next-auth/react'

import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export function SwapAccountButton() {
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    return null
  }

  const clientEmails = JSON.parse(
    process.env.NEXT_PUBLIC_TEST_CLIENT_EMAIL || '[]',
  ) as string[]
  const trainerEmails = JSON.parse(
    process.env.NEXT_PUBLIC_TEST_TRAINER_EMAIL || '[]',
  ) as string[]
  const handleSwap = async (email?: string) => {
    if (!email) {
      console.warn('No email provided')
      return
    }
    await signIn('account-swap', {
      email,
      redirect: false,
    })
    window.location.reload()
  }

  const CLIENTS = clientEmails.map((email) => ({
    email,
    label: email,
  }))
  const TRAINERS = trainerEmails.map((email) => ({
    email,
    label: email,
  }))

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" iconStart={<User2 />}>
            Select Account
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="text-lg font-medium">
            Trainers
          </DropdownMenuLabel>
          {TRAINERS.map((account) => (
            <DropdownMenuItem
              key={account.email}
              onClick={() => handleSwap(account.email)}
            >
              {account.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-lg font-medium">
            Clients
          </DropdownMenuLabel>
          {CLIENTS.map((account) => (
            <DropdownMenuItem
              key={account.email}
              onClick={() => handleSwap(account.email)}
            >
              {account.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
