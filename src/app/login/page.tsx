import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

import { AnimatedLogo, AnimatedLogoText } from '@/components/animated-logo'
import { authOptions } from '@/lib/auth/config'

import { LoginCard } from './components/login-card'

export const dynamic = 'force-dynamic'

export default async function RequestOtpPage() {
  let user
  try {
    user = await getServerSession(authOptions)
  } catch (error) {
    console.warn(error)
  }

  if (user?.user?.email) {
    return redirect('/fitspace/workout')
  }

  return (
    <div className="flex flex-col items-center h-full bg-zinc-950 px-4">
      <Link href="/" className="py-14">
        <div className="flex flex-col items-center gap-2">
          <AnimatedLogo size={80} infinite={false} forceColor="text-white" />
          <AnimatedLogoText className="text-xl text-white" />
        </div>
      </Link>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <LoginCard />
      </div>
    </div>
  )
}
