import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

import { AnimatedLogo, AnimatedLogoText } from '@/components/animated-logo'
import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser } from '@/lib/getUser'

import { LoginCard } from './components/login-card'

export default async function RequestOtpPage() {
  const user = await getCurrentUser()

  if (user?.user.role) {
    const role = user.user.role
    if (role === GQLUserRole.Client) {
      redirect('/fitspace/dashboard')
    } else if (role === GQLUserRole.Trainer) {
      redirect('/trainer/dashboard')
    }
  }
  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-100 dark:bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 px-4 space-y-8">
      <Link href="/">
        <div className="-mt-16 flex flex-col items-center gap-2">
          <AnimatedLogo size={120} infinite={false} />
          <AnimatedLogoText className="text-2xl" />
        </div>
      </Link>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <LoginCard />
      </div>
    </div>
  )
}
