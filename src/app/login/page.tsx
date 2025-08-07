import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

import { AnimatedLogo, AnimatedLogoText } from '@/components/animated-logo'
import { GQLUserRole } from '@/generated/graphql-server'
import { authOptions } from '@/lib/auth'
import { getCurrentUser } from '@/lib/getUser'

import { LoginCard } from './components/login-card'

export default async function RequestOtpPage() {
  let user
  try {
    user = await getServerSession(authOptions)
    console.log(user)
  } catch (error) {
    console.warn(error)
  }

  if (user?.user?.email) {
    return redirect('/fitspace/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-950 px-4 space-y-8">
      <Link href="/">
        <div className="-mt-16 flex flex-col items-center gap-2 relative z-10">
          <AnimatedLogo size={120} infinite={false} forceColor="text-white" />
          <AnimatedLogoText className="text-2xl text-white" />
        </div>
      </Link>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <LoginCard />
      </div>
    </div>
  )
}
