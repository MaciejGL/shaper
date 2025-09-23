'use client'

import { CheckSquare, Mail } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EmailChangeFlowProps {
  currentEmail: string
  onCancel: () => void
  onSuccess?: () => void
}

type FlowStep = 'new-email' | 'verify-otp' | 'success'

export function EmailChangeFlow({
  currentEmail,
  onCancel,
  onSuccess,
}: EmailChangeFlowProps) {
  const [step, setStep] = useState<FlowStep>('new-email')
  const [newEmail, setNewEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRequestVerification = async () => {
    if (!newEmail || newEmail === currentEmail) {
      toast.error('Please enter a valid new email address')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/request-email-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send verification email')
      }

      toast.success('Verification code sent to your new email address')
      setStep('verify-otp')
    } catch (error) {
      console.error('Email change request failed:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to send verification email',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      toast.error('Please enter the 4-digit verification code')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-email-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, otp }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Invalid verification code')
      }

      setStep('success')
      toast.success('Email address updated successfully!')

      // Call success callback if provided
      onSuccess?.()

      // Log out user immediately for security and redirect to login
      setTimeout(async () => {
        await signOut({
          callbackUrl: '/login?message=email-changed',
          redirect: true,
        })
      }, 2000)
    } catch (error) {
      console.error('Email verification failed:', error)
      toast.error(
        error instanceof Error ? error.message : 'Invalid verification code',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'new-email':
        return (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentEmail">Current Email</Label>
              <Input
                id="currentEmail"
                value={currentEmail}
                disabled
                variant="secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your new email address"
                variant="secondary"
              />
            </div>
            <div className="border border-amber-500/50 rounded-lg p-3">
              <p className="text-sm text-amber-500">
                <strong>Important:</strong> You'll need to verify your new email
                address before the change takes effect. Your current email will
                remain active until verification is complete.
              </p>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-2 pt-2">
              <Button
                variant="tertiary"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestVerification}
                loading={isLoading}
                disabled={!newEmail || newEmail === currentEmail}
              >
                Send Verification Code
              </Button>
            </div>
          </CardContent>
        )

      case 'verify-otp':
        return (
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                We've sent a 4-digit verification code to:
              </p>
              <p className="font-medium">{newEmail}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                placeholder="Enter 4-digit code"
                className="text-center text-lg tracking-widest"
                maxLength={4}
                variant="secondary"
              />
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-2 pt-2">
              <Button
                variant="tertiary"
                onClick={() => setStep('new-email')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleVerifyOtp}
                loading={isLoading}
                disabled={otp.length !== 4}
              >
                Verify Email
              </Button>
            </div>
          </CardContent>
        )

      case 'success':
        return (
          <CardContent className="space-y-4 text-center">
            <div className="text-green-600 text-lg font-medium">
              <CheckSquare className="size-8" /> Email Changed Successfully!
            </div>
            <p className="text-sm text-muted-foreground">
              Your email address has been updated to <strong>{newEmail}</strong>
              . You're being logged out for security and will be redirected to
              sign in with your new email.
            </p>
            <div className="animate-pulse text-sm text-muted-foreground">
              Logging out and redirecting...
            </div>
          </CardContent>
        )
    }
  }

  return (
    <Card className="mb-6" borderless>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="size-6" /> Email Address
        </CardTitle>
      </CardHeader>
      {renderStep()}
    </Card>
  )
}
