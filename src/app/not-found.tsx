import { ArrowLeft, Home } from 'lucide-react'
import Image from 'next/image'

import { AnimatedLogo } from '@/components/animated-logo'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full space-y-4">
      <AnimatedLogo size={80} infinite={false} />
      <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
        Page Not Found
      </h1>
      <p className="text-muted-foreground text-sm text-center">
        Looks like we couldn't find the page you're looking for.
        <br />
        Try going back to the app.
      </p>
      <div className="flex flex-col gap-2 mt-4">
        <ButtonLink href="/fitspace/workout" iconStart={<ArrowLeft />}>
          Go To Workout
        </ButtonLink>

        <div className="text-xs text-muted-foreground">
          Need help? Contact your trainer or check our help section.
        </div>
      </div>
    </div>
  )
}
