'use client'

import { ChevronRight, Trophy } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { ExercisePRDrawer } from './exercise-pr-drawer'
import { PRItem } from './pr-item'
import { PRsDrawer } from './prs-drawer'
import { useLatestPRs } from './use-latest-prs'

export function LatestPRs() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedPersonalRecord, setSelectedPersonalRecord] = useState<{
    id: string
    name: string
    exerciseId: string
  } | null>(null)

  const { recentPRs, isLoading } = useLatestPRs()

  return (
    <>
      <Card borderless>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Latest PRs
          </CardTitle>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            iconEnd={<ChevronRight className="h-4 w-4" />}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Loading PRs...</p>
            </div>
          ) : recentPRs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No personal records yet</p>
              <p className="text-xs mt-1">
                Complete some workouts to see your PRs here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPRs.map((pr) => (
                <PRItem
                  key={pr.id}
                  pr={pr}
                  onClick={() =>
                    setSelectedPersonalRecord({
                      id: pr.id,
                      name: pr.exerciseName,
                      exerciseId: pr.exerciseId,
                    })
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PRsDrawer
        isOpen={isDrawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDrawerOpen(false)
            setSelectedPersonalRecord(null)
          }
        }}
        selectedPersonalRecord={selectedPersonalRecord}
        onSelectPersonalRecord={setSelectedPersonalRecord}
      />

      <ExercisePRDrawer
        isOpen={!!selectedPersonalRecord}
        onOpenChange={(open) => !open && setSelectedPersonalRecord(null)}
        personalRecord={selectedPersonalRecord}
      />
    </>
  )
}
