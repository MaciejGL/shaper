'use client'

import { CreditCard, ExternalLink, Shield } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { GQLMyTeamsQuery } from '@/generated/graphql-client'

interface TeamStripeConnectProps {
  team: GQLMyTeamsQuery['myTeams'][number]
}

export function TeamStripeConnect({ team }: TeamStripeConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isOpeningDashboard, setIsOpeningDashboard] = useState(false)

  // Check if team has Stripe Connect account configured
  const isConnected = team.hasStripeConnect

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/team/stripe/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create onboarding link')
      }

      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl
    } catch (error) {
      console.error('Error creating onboarding link:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create onboarding link',
      )
    } finally {
      setIsConnecting(false)
    }
  }

  const handleOpenDashboard = async () => {
    setIsOpeningDashboard(true)
    try {
      const response = await fetch('/api/team/stripe/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to access dashboard')
      }

      // Open dashboard in new tab
      window.open(data.dashboardUrl, '_blank')
    } catch (error) {
      console.error('Error accessing dashboard:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to access dashboard',
      )
    } finally {
      setIsOpeningDashboard(false)
    }
  }

  if (!team.isAdmin) {
    return null // Only show to team admins
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Payment Setup
        </CardTitle>
        <CardDescription>
          Configure Stripe Connect to receive payments for your team's services
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isConnected ? (
          // Connected state
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="gap-1">
                <Shield className="size-3" />
                Connected
              </Badge>
              <span className="text-sm text-muted-foreground">
                Ready to receive payments
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleOpenDashboard}
                disabled={isOpeningDashboard}
                iconStart={<ExternalLink />}
              >
                {isOpeningDashboard ? 'Opening...' : 'Open Stripe Dashboard'}
              </Button>
            </div>
          </div>
        ) : (
          // Not connected state
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Not Connected</Badge>
              <span className="text-sm text-muted-foreground">
                Complete setup to start receiving payments
              </span>
            </div>

            <div className="p-4 rounded-lg border bg-muted/20">
              <h4 className="text-sm font-medium mb-2">What you'll get:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Receive {100 - (team.platformFeePercent || 12)}% of all team
                  service payments
                </li>
                <li>• Automatic daily transfers to your bank account</li>
                <li>• Full payment analytics and reporting</li>
                <li>• Secure payment processing for all currencies</li>
              </ul>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              iconStart={<CreditCard />}
              className="w-full sm:w-auto"
            >
              {isConnecting ? 'Setting up...' : 'Connect with Stripe'}
            </Button>

            <p className="text-xs text-muted-foreground">
              You'll be redirected to Stripe to complete the secure setup
              process. This usually takes 2-3 minutes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
