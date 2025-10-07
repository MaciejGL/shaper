'use client'

import { ExternalLink, Settings } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useMobileApp } from '@/components/mobile-app-bridge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ExternalAccountManagement() {
  const { isNativeApp } = useMobileApp()
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenAccountManagement = async () => {
    setIsLoading(true)

    try {
      let accountManagementUrl = `${window.location.origin}/account-management`

      // If in native app, fetch session token and append to URL
      if (isNativeApp) {
        try {
          const response = await fetch('/api/auth/generate-session-token', {
            method: 'POST',
          })

          if (response.ok) {
            const { sessionToken } = await response.json()
            accountManagementUrl += `?session_token=${encodeURIComponent(sessionToken)}`
          }
        } catch (error) {
          console.error('Failed to generate session token:', error)
          // Continue without token - user may need to login
        }

        // Force external browser opening for native app
        const opened = window.open(
          accountManagementUrl,
          '_blank',
          'noopener,noreferrer,external=true',
        )

        if (!opened) {
          // Fallback: create link element
          const link = document.createElement('a')
          link.href = accountManagementUrl
          link.target = '_blank'
          link.rel = 'noopener noreferrer external'
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } else {
        window.open(accountManagementUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      console.error('Error opening account management:', error)
      toast.error('Failed to open account management')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-xl col-span-2 lg:col-span-1">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-3">
          <div className="size-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shrink-0 self-start">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Manage Account &amp; Subscriptions</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage subscriptions, billing, and account data
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex justify-center">
        <Button
          onClick={handleOpenAccountManagement}
          iconEnd={<ExternalLink />}
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Open Account Management
        </Button>
      </CardContent>
    </Card>
  )
}
