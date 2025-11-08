'use client'

import { ExternalLink, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOpenUrl } from '@/hooks/use-open-url'

export function ExternalAccountManagement() {
  const { openUrl, isLoading } = useOpenUrl({
    errorMessage: 'Failed to open account management',
  })

  const handleOpenAccountManagement = () => {
    openUrl('/account-management')
  }

  return (
    <Card className="col-span-2 lg:col-span-1">
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
