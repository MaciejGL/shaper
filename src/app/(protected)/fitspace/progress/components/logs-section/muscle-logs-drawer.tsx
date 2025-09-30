'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { EnhancedBodyView } from '@/components/human-body/enhanced-body-view'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

interface MuscleLogsDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function MuscleLogsDrawer({
  isOpen,
  onOpenChange,
}: MuscleLogsDrawerProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)

  // Placeholder data - will be replaced with real data in Phase 3
  const muscleProgress = {
    chest: { current: 85, previous: 80, change: '+5' },
    back: { current: 90, previous: 85, change: '+5' },
    shoulders: { current: 70, previous: 68, change: '+2' },
    arms: { current: 60, previous: 58, change: '+2' },
    legs: { current: 120, previous: 115, change: '+5' },
    core: { current: 45, previous: 42, change: '+3' },
  }

  const handleMuscleClick = (muscleAlias: string) => {
    setSelectedMuscle(muscleAlias)
  }

  const getMuscleProgress = (muscleAlias: string) => {
    const key = muscleAlias.toLowerCase() as keyof typeof muscleProgress
    return muscleProgress[key] || { current: 0, previous: 0, change: '0' }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent
        className="max-h-[90vh]"
        dialogTitle="Muscle Progress Overview"
      >
        <DrawerHeader>
          <DrawerTitle>Muscle Progress Overview</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-6 overflow-y-auto">
          {/* Body View with Muscle Badges */}
          <div className="flex justify-center">
            <div className="relative">
              <EnhancedBodyView
                selectedMuscleGroups={selectedMuscle ? [selectedMuscle] : []}
                onMuscleGroupClick={handleMuscleClick}
                muscleGroups={[]} // Will be populated in Phase 3
              />

              {/* Custom badges for muscle progress */}
              <div className="absolute top-4 left-4 space-y-2">
                {Object.entries(muscleProgress).map(([muscle, progress]) => (
                  <Badge
                    key={muscle}
                    variant={
                      selectedMuscle === muscle ? 'primary' : 'secondary'
                    }
                    className="cursor-pointer"
                    onClick={() => handleMuscleClick(muscle)}
                  >
                    {muscle}: {progress.current}kg ({progress.change})
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Muscle Details */}
          {selectedMuscle && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium capitalize">
                  {selectedMuscle} Progress
                </h3>
                <Button size="sm" iconStart={<Plus className="h-4 w-4" />}>
                  Add Log
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-card-on-card rounded-lg text-center">
                  <div className="text-lg font-semibold">
                    {getMuscleProgress(selectedMuscle).current} kg
                  </div>
                  <div className="text-xs text-muted-foreground">Current</div>
                </div>
                <div className="p-3 bg-card-on-card rounded-lg text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {getMuscleProgress(selectedMuscle).change} kg
                  </div>
                  <div className="text-xs text-muted-foreground">Change</div>
                </div>
              </div>

              {/* Recent logs for selected muscle */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recent Logs</h4>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-card-on-card rounded"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {getMuscleProgress(selectedMuscle).current - i} kg
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {i} day{i > 1 ? 's' : ''} ago
                        </div>
                      </div>
                      <Button size="xs" variant="ghost">
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
