'use client'

import { ExternalLink, Settings } from 'lucide-react'
import { toast } from 'sonner'

import { useMobileApp } from '@/components/mobile-app-bridge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ExternalAccountManagement() {
  const { isNativeApp } = useMobileApp()

  const handleOpenAccountManagement = () => {
    const accountManagementUrl = `${window.location.origin}/account-management`

    if (isNativeApp) {
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

      toast.success('Opening account management in your browser...', {
        description: 'Your app will remain open in the background',
      })
    } else {
      // Mobile browser - open normally
      window.open(accountManagementUrl, '_blank', 'noopener,noreferrer')
      toast.success('Opening account management...')
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-3">
          <div className="size-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shrink-0 self-start">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              Manage Account &amp; Subscriptions
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage subscriptions, billing, and account data
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Environment-specific info notice */}

          <Button
            onClick={handleOpenAccountManagement}
            className="w-full"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Account Management
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
