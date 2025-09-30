'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Trophy } from 'lucide-react'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'
import {
  GQLGetUserPrHistoryQuery,
  useGetUserPrHistoryQuery,
} from '@/generated/graphql-client'

import { ExerciseProgressChart } from './exercise-progress-chart'
import { PRItem } from './pr-item'

interface ExercisePRDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  personalRecord: { id: string; name: string; exerciseId: string } | null
}

export function ExercisePRDrawer({
  isOpen,
  onOpenChange,
  personalRecord,
}: ExercisePRDrawerProps) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const cachedData = queryClient.getQueryData<GQLGetUserPrHistoryQuery>(
    useGetUserPrHistoryQuery.getKey({ userId: user?.id || '' }),
  )

  const exercisePRs =
    cachedData?.getUserPRHistory.filter(
      (pr) => pr.exerciseId === personalRecord?.exerciseId,
    ) || []

  if (!personalRecord) return null

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent
        className="max-h-[90vh]"
        dialogTitle={`${personalRecord.name} Progress`}
      >
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            {personalRecord.name} Progress
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-6 overflow-y-auto">
          {/* Progress Chart */}
          {personalRecord && (
            <ExerciseProgressChart
              exercisePRs={exercisePRs}
              exerciseId={personalRecord.exerciseId}
            />
          )}

          {/* PR History */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Personal Records History</h3>
            {exercisePRs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Trophy className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No PRs for this exercise</p>
              </div>
            ) : (
              <div className="space-y-2">
                {exercisePRs.map((pr) => (
                  <PRItem key={pr.id} pr={pr} />
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
