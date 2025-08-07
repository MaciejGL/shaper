import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

import { AnimatedLogo, AnimatedLogoText } from '@/components/animated-logo'
import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser } from '@/lib/getUser'

import { LoginCard } from './components/login-card'

export default async function RequestOtpPage() {
  try {
    const user = await getCurrentUser()

    // Only redirect if we have a complete, valid user session
    if (user?.user?.id && user?.user?.role && user?.session) {
      const role = user.user.role
      if (role === GQLUserRole.Client) {
        redirect('/fitspace/dashboard')
      } else if (role === GQLUserRole.Trainer) {
        redirect('/trainer/dashboard')
      }
    }
  } catch (error) {
    // If there's any error getting the user (during logout transitions),
    // just show the login page instead of crashing
    console.error('Auth check error (expected during logout):', error)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-100 dark:bg-zinc-950 px-4 space-y-8">
      <Link href="/">
        <div className="-mt-16 flex flex-col items-center gap-2 relative z-10">
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
