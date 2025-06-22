'use client'

import { ArrowRightLeftIcon } from 'lucide-react'
import { signIn } from 'next-auth/react'

import { GQLUserRole } from '@/generated/graphql-server'
import { UserWithSession } from '@/types/UserWithSession'

import { Button } from '../ui/button'

export const SwapAccountButton = ({
  user,
}: {
  user?: UserWithSession | null
}) => {
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    return null
  }

  // Define the email or logic for the other account type
  const clientEmail = process.env.NEXT_PUBLIC_TEST_CLIENT_EMAIL
  const trainerEmail = process.env.NEXT_PUBLIC_TEST_TRAINER_EMAIL
  const swapTo =
    user?.user.role === GQLUserRole.Client ? trainerEmail : clientEmail
  const handleSwap = async () => {
    await signIn('account-swap', {
      email: swapTo,
    })
  }

  return (
    <Button
      variant="default"
      onClick={handleSwap}
      iconStart={<ArrowRightLeftIcon />}
    >
      {user?.user.role === GQLUserRole.Client ? 'Trainer' : 'Client'}
    </Button>
  )
}
