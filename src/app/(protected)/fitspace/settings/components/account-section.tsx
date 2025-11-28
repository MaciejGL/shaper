'use client'

import { useQueryClient } from '@tanstack/react-query'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUser } from '@/context/user-context'
import {
  GQLLogType,
  GQLTimeframeType,
  useDeleteUserAccountMutation,
  useResetUserLogsMutation,
} from '@/generated/graphql-client'

import { ResetLogsModal } from './reset-logs-modal'

function DestructiveActionValidator({
  expectedText,
  onValidationChange,
  actionType,
  additionalWarning,
}: {
  expectedText: string
  onValidationChange: (isValid: boolean) => void
  actionType: string
  additionalWarning?: string
}) {
  const [inputValue, setInputValue] = useState('')
  const isValid = inputValue.toLowerCase() === expectedText.toLowerCase()

  useEffect(() => {
    onValidationChange(isValid)
  }, [isValid, onValidationChange])

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

    const timeoutId = setTimeout(initializeConfirmButton, 100)
    return () => clearTimeout(timeoutId)
  }, [])

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

    const timeoutId = setTimeout(updateConfirmButton, 100)
    return () => clearTimeout(timeoutId)
  }, [isValid])

  return (
    <div className="space-y-3">
      {additionalWarning && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
            {additionalWarning}
          </p>
        </div>
      )}
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

export function AccountSection() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { openModal } = useConfirmationModalContext()
  const queryClient = useQueryClient()
  const { user, subscription } = useUser()

  const isTrainer = user?.role === 'TRAINER'
  const hasActiveSubscription = subscription?.hasPremium ?? false

  const { mutateAsync: resetLogs } = useResetUserLogsMutation({
    onSuccess: () => {
      toast.success('Account logs reset successfully')
      queryClient.clear()
    },
    onError: (error: Error) => {
      console.error('Failed to reset logs:', error)
      toast.error('Failed to reset account logs. Please try again.')
    },
  })

  const { mutateAsync: deleteAccount } = useDeleteUserAccountMutation({
    onSuccess: () => {
      toast.success('Account deleted successfully')
      queryClient.clear()
      window.location.href = '/login'
    },
    onError: (error: Error) => {
      console.error('Failed to delete account:', error)
      toast.error('Failed to delete account. Please try again.')
    },
  })

  const handleResetLogs = async (params: {
    logTypes: ('WORKOUT_LOGS' | 'BODY_MEASUREMENTS' | 'PROGRESS_PHOTOS' | 'PERSONAL_RECORDS')[]
    timeframeType: 'RELATIVE' | 'DATE_RANGE'
    relativePeriod?: string
    fromDate?: string
    toDate?: string
  }) => {
    setIsResetting(true)
    try {
      const logTypeMap: Record<string, GQLLogType> = {
        WORKOUT_LOGS: GQLLogType.WorkoutLogs,
        BODY_MEASUREMENTS: GQLLogType.BodyMeasurements,
        PROGRESS_PHOTOS: GQLLogType.ProgressPhotos,
        PERSONAL_RECORDS: GQLLogType.PersonalRecords,
      }

      const timeframeMap: Record<string, GQLTimeframeType> = {
        RELATIVE: GQLTimeframeType.Relative,
        DATE_RANGE: GQLTimeframeType.DateRange,
      }

      await resetLogs({
        input: {
          logTypes: params.logTypes.map((t) => logTypeMap[t]),
          timeframeType: timeframeMap[params.timeframeType],
          relativePeriod: params.relativePeriod,
          fromDate: params.fromDate,
          toDate: params.toDate,
        },
      })
      setIsResetModalOpen(false)
    } finally {
      setIsResetting(false)
    }
  }

  const handleDeleteAccount = () => {
    let isValidationPassed = false

    const subscriptionWarning = hasActiveSubscription
      ? 'Your subscription will be cancelled immediately. No additional charges will occur.'
      : undefined

    openModal({
      title: 'Delete Account',
      description:
        'This will permanently delete your account and all associated data including workouts, progress photos, personal records, and preferences. All your data will be removed from our servers.',
      confirmText: 'Delete Account',
      variant: 'destructive',
      children: (
        <DestructiveActionValidator
          expectedText="delete"
          actionType="delete"
          additionalWarning={subscriptionWarning}
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
    <>
      <div className={`grid grid-cols-1 ${isTrainer ? '' : 'md:grid-cols-2'} gap-8`}>
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="size-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shrink-0 self-start">
                <RotateCcw className="size-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Reset Account Data</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Selectively delete your logs and data
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <ul className="list-disc list-inside mb-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li className="font-medium">Workout logs</li>
                  <li className="font-medium">Body measurements</li>
                  <li className="font-medium">Progress photos</li>
                  <li className="font-medium">Personal records</li>
                </ul>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose what to delete and the timeframe. Your profile and
                  preferences will remain intact.
                </p>
                <Button
                  onClick={() => setIsResetModalOpen(true)}
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

        {!isTrainer && (
          <Card className="bg-card">
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

            <CardContent className="pt-0 flex flex-col justify-between h-full">
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will permanently delete your account and all associated
                  data. This action cannot be undone.
                </p>
                {hasActiveSubscription && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    Your active subscription will be cancelled.
                  </p>
                )}
              </div>

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
        )}
      </div>

      <ResetLogsModal
        open={isResetModalOpen}
        onOpenChange={setIsResetModalOpen}
        onConfirm={handleResetLogs}
        isLoading={isResetting}
      />
    </>
  )
}
