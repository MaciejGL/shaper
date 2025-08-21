'use client'

import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'

import { UserSearch } from './user-search'
import { UserSubscriptionDetails } from './user-subscription-details'

export function SubscriptionManagement() {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [showUserSubscriptions, setShowUserSubscriptions] = useState(false)
  const [actionResult, setActionResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleUserSelected = (userId: string) => {
    setSelectedUserId(userId)
    setShowUserSubscriptions(true)
    setActionResult(null)
  }

  const handleClearUser = () => {
    setSelectedUserId('')
    setShowUserSubscriptions(false)
    setActionResult(null)
  }

  const handleActionComplete = (result: {
    success: boolean
    message: string
  }) => {
    setActionResult(result)
  }

  return (
    <div className="space-y-6">
      <UserSearch onUserSelected={handleUserSelected} />

      {actionResult && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{actionResult.message}</AlertDescription>
        </Alert>
      )}

      {showUserSubscriptions && selectedUserId && (
        <UserSubscriptionDetails
          userId={selectedUserId}
          onClear={handleClearUser}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  )
}
