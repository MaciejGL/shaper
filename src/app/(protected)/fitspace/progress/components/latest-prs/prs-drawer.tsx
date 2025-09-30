'use client'

import { Trophy } from 'lucide-react'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

import { PRItem } from './pr-item'
import { useLatestPRs } from './use-latest-prs'

interface PRsDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedPersonalRecord?: {
    id: string
    name: string
    exerciseId: string
  } | null
  onSelectPersonalRecord: (personalRecord: {
    id: string
    name: string
    exerciseId: string
  }) => void
}

export function PRsDrawer({
  isOpen,
  onOpenChange,
  selectedPersonalRecord,
  onSelectPersonalRecord,
}: PRsDrawerProps) {
  const { weeklyPRs, isLoading } = useLatestPRs()

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent
        dialogTitle="Personal Records History"
        className="max-h-[80vh]"
      >
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            {selectedPersonalRecord
              ? `${selectedPersonalRecord.name} PRs`
              : 'Personal Records History'}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-6 overflow-y-auto">
          {selectedPersonalRecord ? (
            // Show exercise-specific PRs
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">
                {selectedPersonalRecord.name} Progress
              </h3>
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Loading exercise PRs...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {weeklyPRs
                    .flatMap((week) => week.prs)
                    .filter(
                      (pr) => pr.exerciseName === selectedPersonalRecord.name,
                    )
                    .map((pr) => (
                      <PRItem
                        key={pr.id}
                        pr={pr}
                        onClick={() =>
                          onSelectPersonalRecord({
                            id: pr.id,
                            name: pr.exerciseName,
                            exerciseId: pr.exerciseId,
                          })
                        }
                      />
                    ))}
                </div>
              )}
            </div>
          ) : // Show all PRs grouped by week
          isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Loading PR history...</p>
            </div>
          ) : weeklyPRs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No PR history found</p>
            </div>
          ) : (
            weeklyPRs.map((weekData) => (
              <div key={weekData.week} className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">
                  {weekData.week}
                </h3>
                <div className="space-y-2">
                  {weekData.prs.map((pr) => (
                    <PRItem
                      key={pr.id}
                      pr={pr}
                      onClick={() =>
                        onSelectPersonalRecord({
                          id: pr.id,
                          name: pr.exerciseName,
                          exerciseId: pr.exerciseId,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
