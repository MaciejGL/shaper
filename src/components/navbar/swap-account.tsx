'use client'

import { User2 } from 'lucide-react'
import { signIn } from 'next-auth/react'

import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export const SwapAccountButton = () => {
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    return null
  }

  // Define the email or logic for the other account type
  const clientEmail = process.env.NEXT_PUBLIC_TEST_CLIENT_EMAIL
  const client2Email = process.env.NEXT_PUBLIC_TEST_CLIENT2_EMAIL
  const client3Email = process.env.NEXT_PUBLIC_TEST_CLIENT3_EMAIL
  const trainerEmail = process.env.NEXT_PUBLIC_TEST_TRAINER_EMAIL
  const trainer2Email = process.env.NEXT_PUBLIC_TEST_TRAINER2_EMAIL
  const trainer3Email = process.env.NEXT_PUBLIC_TEST_TRAINER3_EMAIL

  const handleSwap = async (email?: string) => {
    if (!email) {
      console.warn('No email provided')
      return
    }
    await signIn('account-swap', {
      email,
    })
  }

  const ACCOUNTS = [
    {
      email: trainerEmail,
      label: 'Maciej Trainer',
    },
    {
      email: trainer2Email,
      label: 'Trainer Fitspace',
    },
    {
      email: trainer3Email,
      label: 'Dawid Trainer',
    },
    {
      email: clientEmail,
      label: 'Maciej Client',
    },
    {
      email: client2Email,
      label: 'Dawid Client',
    },
    {
      email: client3Email,
      label: 'Irka Client',
    },
  ]

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" iconStart={<User2 />}>
            Select Account
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {ACCOUNTS.map((account) => (
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
