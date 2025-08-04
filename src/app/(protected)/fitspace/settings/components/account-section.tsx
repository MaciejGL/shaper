'use client'

import { useQueryClient } from '@tanstack/react-query'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useDeleteUserAccountMutation,
  useResetUserLogsMutation,
} from '@/generated/graphql-client'
import { useConfirmationModal } from '@/hooks/use-confirmation-modal'
import { UserWithSession } from '@/types/UserWithSession'

interface AccountSectionProps {
  user: UserWithSession
}

export function AccountSection({}: AccountSectionProps) {
  const [isResetting, setIsResetting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { openModal } = useConfirmationModal()
  const queryClient = useQueryClient()

  const { mutateAsync: resetLogs } = useResetUserLogsMutation({
    onSuccess: () => {
      toast.success('Account logs reset successfully')
      queryClient.clear() // Clear all cached queries
    },
    onError: (error: Error) => {
      console.error('Failed to reset logs:', error)
      toast.error('Failed to reset account logs. Please try again.')
    },
  })

  const { mutateAsync: deleteAccount } = useDeleteUserAccountMutation({
    onSuccess: () => {
      toast.success('Account deleted successfully')
      queryClient.clear() // Clear all cached queries
      // Redirect to login page
      window.location.href = '/login'
    },
    onError: (error: Error) => {
      console.error('Failed to delete account:', error)
      toast.error('Failed to delete account. Please try again.')
    },
  })

  const handleResetLogs = () => {
    openModal({
      title: 'Reset Account Logs',
      description:
        'This will permanently delete all your workout logs, exercise data, progress tracking, and meal logs. Your profile and preferences will remain intact. This action cannot be undone.',
      confirmText: 'Reset Logs',
      variant: 'destructive',
      onConfirm: async () => {
        setIsResetting(true)
        try {
          await resetLogs({})
        } finally {
          setIsResetting(false)
        }
      },
    })
  }

  const handleDeleteAccount = () => {
    openModal({
      title: 'Delete Account',
      description:
        'This will permanently delete your account and all associated data including workouts, meals, progress, and preferences. This action cannot be undone.',
      confirmText: 'Delete Account',
      variant: 'destructive',
      onConfirm: async () => {
        setIsDeleting(true)
        try {
          await deleteAccount({})
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="border-0 shadow-xl bg-card">
        {/* Reset Account Data */}
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <RotateCcw className="size-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Reset Account Data</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This will permanently delete all your logs
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <ul className="list-disc list-inside mb-4 text-sm text-gray-600 dark:text-gray-400">
                <li className="font-medium">Workout logs</li>
                <li className="font-medium">Exercise data</li>
                <li className="font-medium">Progress tracking</li>
                <li className="font-medium">Meal logs</li>
              </ul>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your assigned plans, favorite workouts, profile and preferences
                will remain intact.
              </p>
              <Button
                onClick={handleResetLogs}
                disabled={isResetting}
                loading={isResetting}
                className="ml-auto"
              >
                Reset Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-xl bg-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="size-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trash2 className="size-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Delete Account</CardTitle>
            </div>
          </div>
        </CardHeader>

        {/* Delete Account */}
        <CardContent className="pt-0 flex flex-col justify-between h-full">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This will permanently delete your account and all associated data.
            This action cannot be undone.
          </p>

          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            loading={isDeleting}
            className="ml-auto"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
