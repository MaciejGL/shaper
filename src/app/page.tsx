import { Dumbbell, TrendingUp, UserCheck } from 'lucide-react'

import { AnimatedLogo } from '@/components/animated-logo'
import { PWAInstallButton } from '@/components/pwa-install-btn'
import { ButtonLink } from '@/components/ui/button-link'

export default function Home() {
  return (
    <main className="min-h-screen grid grid-rows-1 w-full bg-zinc-100 dark:bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900">
      <div className="flex flex-col items-center gap-8 justify-center h-screen px-4 container overflow-y-auto mx-auto">
        {/* App Logo and Branding */}
        <div className="flex flex-col items-center gap-4 text-center">
          <AnimatedLogo infinite={false} size={120} />
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Fitspace</h1>
            <p className="text-muted-foreground max-w-md">
              Your personal fitness coach. Track workouts, follow training
              plans, and achieve your fitness goals.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <PWAInstallButton
            variant="outline"
            size="lg"
            className="w-full"
            showOnMobile={true}
          />
          <ButtonLink href="/login" className="w-full" size="lg">
            Login
          </ButtonLink>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 max-w-2xl">
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Track Progress</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Monitor your fitness journey
            </p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Custom Workouts</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Personalized training plans
            </p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Professional Trainers</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Expert trainers to help you achieve your goals
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
