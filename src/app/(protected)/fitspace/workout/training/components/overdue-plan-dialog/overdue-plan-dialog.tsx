'use client'

import { useQueryClient } from '@tanstack/react-query'
import { CalendarCheck, Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { revalidatePlanPages } from '@/app/actions/revalidate'
import { BiggyIcon } from '@/components/biggy-icon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useClosePlanMutation } from '@/generated/graphql-client'
import { queryInvalidation } from '@/lib/query-invalidation'

import { OverduePlanDialogProps } from './types'

type DialogStep = 'main' | 'confirm'

export function OverduePlanDialog({
  open,
  onOpenChange,
  planId,
  weeks,
  onDismiss,
}: OverduePlanDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isCompleting, setIsCompleting] = useState(false)
  const [step, setStep] = useState<DialogStep>('main')

  const remainingWorkouts = useMemo(() => {
    return weeks
      .flatMap((week) => week.days)
      .filter(
        (day) => !day.isRestDay && day.exercisesCount > 0 && !day.completedAt,
      ).length
  }, [weeks])

  const { mutate: closePlan } = useClosePlanMutation({
    onSuccess: async () => {
      await Promise.all([
        revalidatePlanPages(),
        queryInvalidation.planStateChange(queryClient),
      ])
      router.refresh()
      router.push('/fitspace/my-plans')
    },
    onError: () => {
      setIsCompleting(false)
    },
  })

  const handleContinue = () => {
    onDismiss()
    onOpenChange(false)
  }

  const handleFinishClick = () => {
    if (remainingWorkouts > 0) {
      setStep('confirm')
    } else {
      handleConfirmFinish()
    }
  }

  const handleConfirmFinish = () => {
    setIsCompleting(true)
    closePlan({ planId })
  }

  const handleBackToMain = () => {
    setStep('main')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (isCompleting) return
    if (!newOpen) {
      setStep('main')
    }
    onOpenChange(newOpen)
  }

  if (step === 'confirm') {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          dialogTitle="Finish plan anyway?"
          withCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Finish plan anyway?
            </DialogTitle>
            <DialogDescription className="text-center">
              You still have {remainingWorkouts} workout
              {remainingWorkouts !== 1 ? 's' : ''} left. You can start a new
              plan after finishing.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={handleBackToMain}
              disabled={isCompleting}
            >
              Keep training
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleConfirmFinish}
              loading={isCompleting}
              disabled={isCompleting}
            >
              Finish plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dialogTitle="Training Plan Ended" withCloseButton={false}>
        <DialogHeader>
          <div className="flex-center my-4">
            <BiggyIcon icon={CalendarCheck} variant="success" />
          </div>
          <DialogTitle className="text-center text-xl">
            Nice work getting this far
          </DialogTitle>
          <DialogDescription className="text-center">
            You&apos;re at the end of the schedule
            {remainingWorkouts > 0 && (
              <>
                , with{' '}
                <span className="font-semibold">
                  {remainingWorkouts} workout
                  {remainingWorkouts !== 1 ? 's' : ''} still available
                </span>
              </>
            )}
            . Continue to complete them, or finish and start something new.
          </DialogDescription>
        </DialogHeader>

        <p className="text-center text-sm text-muted-foreground">
          You can always mark your training as{' '}
          <span className="font-semibold">completed</span> later in your{' '}
          <Link href="/fitspace/my-plans" className="text-primary underline">
            plans page
          </Link>
          or "Activate" a new based on your plan templates.
        </p>

        <DialogFooter className="pt-4">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={handleContinue}
            iconStart={<Play />}
            disabled={isCompleting}
          >
            Continue this plan
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleFinishClick}
            loading={isCompleting}
            disabled={isCompleting}
          >
            Finish plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
