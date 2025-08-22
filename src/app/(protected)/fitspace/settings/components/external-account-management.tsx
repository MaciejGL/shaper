'use client'

import { ExternalLink, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ExternalAccountManagement() {
  const handleOpenAccountManagement = () => {
    const accountManagementUrl = `${window.location.origin}/account-management`

    // For mobile apps, we want to force opening in external browser
    // Using window.open with noopener and noreferrer should force external browser
    const opened = window.open(
      accountManagementUrl,
      '_blank',
      'noopener,noreferrer',
    )

    // Fallback: if window.open was blocked or didn't work, use location.href
    // This should definitely force external browser navigation in mobile apps
    if (!opened) {
      window.location.href = accountManagementUrl
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              Manage Account and Subscriptions
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Access your account settings
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-6">
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
