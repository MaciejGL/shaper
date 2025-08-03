'use client'

import { useQueryClient } from '@tanstack/react-query'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
    <div className="space-y-8">
      {/* Reset Account Data */}
      <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20  rounded-lg">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Reset Account Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This will permanently delete all your:
            </p>
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
            >
              Reset Logs
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Delete Account
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              loading={isDeleting}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
