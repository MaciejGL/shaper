'use client'

import { useQueryClient } from '@tanstack/react-query'
import { RotateCcw, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  useDeleteUserAccountMutation,
  useResetUserLogsMutation,
} from '@/generated/graphql-client'

interface AccountSectionProps {}

// Custom validation component for destructive actions
function DestructiveActionValidator({
  expectedText,
  onValidationChange,
  actionType,
}: {
  expectedText: string
  onValidationChange: (isValid: boolean) => void
  actionType: string
}) {
  const [inputValue, setInputValue] = useState('')
  const isValid = inputValue.toLowerCase() === expectedText.toLowerCase()

  // Notify parent of validation state changes
  useEffect(() => {
    onValidationChange(isValid)
  }, [isValid, onValidationChange])

  // Initialize confirm button as disabled when modal opens
  useEffect(() => {
    const initializeConfirmButton = () => {
      const confirmButton = document.querySelector(
        '[data-confirm-button]',
      ) as HTMLButtonElement
      if (confirmButton) {
        confirmButton.disabled = true
        confirmButton.style.opacity = '0.5'
        confirmButton.style.cursor = 'not-allowed'
      }
    }

    // Use a small delay to ensure the modal is fully rendered
    const timeoutId = setTimeout(initializeConfirmButton, 100)

    return () => clearTimeout(timeoutId)
  }, [])

  // Update confirm button state when validation changes
  useEffect(() => {
    const updateConfirmButton = () => {
      const confirmButton = document.querySelector(
        '[data-confirm-button]',
      ) as HTMLButtonElement
      if (confirmButton) {
        confirmButton.disabled = !isValid
        confirmButton.style.opacity = isValid ? '1' : '0.5'
        confirmButton.style.cursor = isValid ? 'pointer' : 'not-allowed'
      }
    }

    // Use a small delay to ensure the modal is fully rendered
    const timeoutId = setTimeout(updateConfirmButton, 100)

    return () => clearTimeout(timeoutId)
  }, [isValid])

  return (
    <div className="space-y-3">
      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
        <p className="text-sm text-destructive font-medium">
          This action cannot be undone. To confirm, type "{expectedText}" below:
        </p>
      </div>
      <Input
        id={`confirm-${actionType}`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={`Type "${expectedText}" to confirm`}
        className={isValid ? 'border-green-500' : ''}
        autoComplete="off"
      />
    </div>
  )
}

export function AccountSection({}: AccountSectionProps) {
  const [isResetting, setIsResetting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { openModal } = useConfirmationModalContext()
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
    let isValidationPassed = false

    openModal({
      title: 'Reset Account Logs',
      description:
        'This will permanently delete all your workout logs, exercise data, progress tracking, and meal logs. Your profile and preferences will remain intact.',
      confirmText: 'Reset Logs',
      variant: 'destructive',
      children: (
        <DestructiveActionValidator
          expectedText="reset"
          actionType="reset"
          onValidationChange={(isValid) => {
            isValidationPassed = isValid
          }}
        />
      ),
      onConfirm: async () => {
        if (!isValidationPassed) {
          toast.error('Please type "reset" to confirm this action')
          return
        }

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
    let isValidationPassed = false

    openModal({
      title: 'Delete Account',
      description:
        'This will permanently delete your account and all associated data including workouts, meals, progress, and preferences.',
      confirmText: 'Delete Account',
      variant: 'destructive',
      children: (
        <DestructiveActionValidator
          expectedText="delete"
          actionType="delete"
          onValidationChange={(isValid) => {
            isValidationPassed = isValid
          }}
        />
      ),
      onConfirm: async () => {
        if (!isValidationPassed) {
          toast.error('Please type "delete" to confirm this action')
          return
        }

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
            <div className="size-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shrink-0 self-start">
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
              <ul className="list-disc list-inside mb-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
            <div className="size-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shrink-0 self-start">
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
