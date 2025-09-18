import Link from 'next/link'
import { Suspense } from 'react'

import { AnimatedLogo, AnimatedLogoText } from '@/components/animated-logo'
import { Button } from '@/components/ui/button'

import { ErrorContent } from './components/error-content'

export const dynamic = 'force-dynamic'

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-950 px-4 space-y-8">
      <Link href="/">
        <div className="-mt-16 flex flex-col items-center gap-2 relative z-10">
          <AnimatedLogo size={120} infinite={false} forceColor="text-white" />
          <AnimatedLogoText className="text-2xl text-white" />
        </div>
      </Link>

      <div className="flex flex-col gap-6 w-full max-w-md text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Sign-in Error</h1>
          <p className="text-gray-400">
            There was a problem signing you in. This could happen if you
            cancelled the sign-in process or there was a temporary issue.
          </p>
        </div>

        <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
          <ErrorContent />
        </Suspense>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/login">Try signing in again</Link>
          </Button>

          <Button variant="ghost" asChild className="w-full text-gray-400">
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
