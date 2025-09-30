'use client'

import { format } from 'date-fns'
import { Camera, TrendingDown, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

interface SnapshotTimelineDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function SnapshotTimelineDrawer({
  isOpen,
  onOpenChange,
}: SnapshotTimelineDrawerProps) {
  // Placeholder data - will be replaced with real data in Phase 3
  const snapshots = [
    {
      id: '1',
      imageUrl: '/placeholder-snapshot.jpg',
      date: new Date().toISOString(),
      weight: 77,
      bodyFat: 15,
      muscleMass: 65,
    },
    {
      id: '2',
      imageUrl: '/placeholder-snapshot.jpg',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      weight: 76.5,
      bodyFat: 15.2,
      muscleMass: 64.8,
    },
    {
      id: '3',
      imageUrl: '/placeholder-snapshot.jpg',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      weight: 76,
      bodyFat: 15.5,
      muscleMass: 64.5,
    },
    {
      id: '4',
      imageUrl: '/placeholder-snapshot.jpg',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      weight: 75,
      bodyFat: 16,
      muscleMass: 63,
    },
  ]

  const getChangeIndicator = (
    current: number,
    previous: number,
    isGood: boolean,
  ) => {
    const change = current - previous
    if (change === 0) return null

    const isPositive = change > 0
    const isGoodChange = isGood ? isPositive : !isPositive

    return (
      <div
        className={`flex items-center gap-1 text-xs ${
          isGoodChange ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {Math.abs(change).toFixed(1)}
      </div>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]" dialogTitle="Snapshot Timeline">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-500" />
            Snapshot Timeline
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          {snapshots.map((snapshot, index) => {
            const previousSnapshot = snapshots[index + 1]
            const isLatest = index === 0

            return (
              <div
                key={snapshot.id}
                className="flex gap-4 p-4 bg-card-on-card rounded-lg"
              >
                {/* Snapshot Image */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-24 bg-muted/20 rounded-lg flex items-center justify-center relative">
                    <div className="text-center text-muted-foreground">
                      <Camera className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">Photo</p>
                    </div>
                    {isLatest && (
                      <Badge
                        className="absolute -top-2 -right-2"
                        variant="success"
                      >
                        Latest
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Snapshot Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {format(new Date(snapshot.date), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(snapshot.date), 'HH:mm')}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{snapshot.weight} kg</div>
                      <div className="text-xs text-muted-foreground">
                        Weight
                      </div>
                      {previousSnapshot &&
                        getChangeIndicator(
                          snapshot.weight,
                          previousSnapshot.weight,
                          false, // weight increase is not necessarily good
                        )}
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{snapshot.bodyFat}%</div>
                      <div className="text-xs text-muted-foreground">
                        Body Fat
                      </div>
                      {previousSnapshot &&
                        getChangeIndicator(
                          snapshot.bodyFat,
                          previousSnapshot.bodyFat,
                          false, // body fat decrease is good
                        )}
                    </div>
                    <div className="text-center">
                      <div className="font-medium">
                        {snapshot.muscleMass} kg
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Muscle
                      </div>
                      {previousSnapshot &&
                        getChangeIndicator(
                          snapshot.muscleMass,
                          previousSnapshot.muscleMass,
                          true, // muscle increase is good
                        )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="xs" variant="outline">
                      View
                    </Button>
                    <Button size="xs" variant="outline">
                      Compare
                    </Button>
                    <Button size="xs" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
