import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { AnimatedLogo, AnimatedLogoText } from '@/components/animated-logo'
import { authOptions } from '@/lib/auth/config'

import { ExistingSessionHandoff } from '../auth/mobile/start/existing-session-handoff'
import { MobileOAuthTrigger } from '../auth/mobile/start/mobile-oauth-trigger'

import { EmailChangeSuccess } from './components/email-change-success'
import { LoginCard } from './components/login-card'

export const dynamic = 'force-dynamic'

export default async function RequestOtpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const startProvider = params?.start as string | undefined
  const callbackUrl = params?.callbackUrl as string | undefined

  let session
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.warn(error)
  }

  // Regular login - redirect if already logged in
  if (session?.user?.email && !startProvider) {
    return redirect('/fitspace/workout')
  }

  // Check for mobile OAuth flow
  if (startProvider === 'google' && callbackUrl) {
    // Check for existing session
    if (session?.user?.email) {
      const userName = session.user.name || session.user.email
      return (
        <ExistingSessionHandoff userName={userName} callbackUrl={callbackUrl} />
      )
    }

    return <MobileOAuthTrigger callbackUrl={callbackUrl} />
  }

  return (
    <div className="flex flex-col items-center h-full bg-zinc-950 px-4 pb-12">
      <Link href="/" className="py-14">
        <div className="flex flex-col items-center gap-2">
          <AnimatedLogo size={80} infinite={false} forceColor="text-white" />
          <AnimatedLogoText className="text-xl text-white" />
        </div>
      </Link>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Suspense fallback={null}>
          <EmailChangeSuccess />
        </Suspense>
        <LoginCard />
        <p className="text-center text-xs text-zinc-500 px-4">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-zinc-400 underline hover:text-white">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-zinc-400 underline hover:text-white">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
