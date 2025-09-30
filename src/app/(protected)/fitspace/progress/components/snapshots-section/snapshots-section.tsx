'use client'

import { Camera, ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'

import { SnapshotTimelineDrawer } from './snapshot-timeline-drawer'

export function SnapshotsSection() {
  const { user } = useUser()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Placeholder data - will be replaced with real data in Phase 3
  const latestSnapshot = {
    id: '1',
    imageUrl: '/placeholder-snapshot.jpg',
    date: new Date().toISOString(),
    weight: 77,
    bodyFat: 15,
  }

  const previousSnapshot = {
    id: '2',
    imageUrl: '/placeholder-snapshot.jpg',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    weight: 75,
    bodyFat: 16,
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-500" />
            Progress Snapshots
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              iconStart={<Plus className="h-4 w-4" />}
            >
              Add Snapshot
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              iconEnd={<ChevronRight className="h-4 w-4" />}
            >
              View Timeline
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Snapshot Comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Latest Snapshot */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-center">Latest</div>
                <div className="aspect-[3/4] bg-muted/20 rounded-lg flex items-center justify-center relative">
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Latest Snapshot</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    {latestSnapshot.weight}kg
                  </div>
                </div>
                <div className="text-xs text-center text-muted-foreground">
                  {new Date(latestSnapshot.date).toLocaleDateString()}
                </div>
              </div>

              {/* Previous Snapshot */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-center">Previous</div>
                <div className="aspect-[3/4] bg-muted/20 rounded-lg flex items-center justify-center relative">
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Previous Snapshot</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    {previousSnapshot.weight}kg
                  </div>
                </div>
                <div className="text-xs text-center text-muted-foreground">
                  {new Date(previousSnapshot.date).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Comparison Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-card-on-card rounded-lg">
                <div className="text-lg font-semibold text-green-600">
                  +{latestSnapshot.weight - previousSnapshot.weight} kg
                </div>
                <div className="text-xs text-muted-foreground">
                  Weight Change
                </div>
              </div>
              <div className="text-center p-3 bg-card-on-card rounded-lg">
                <div className="text-lg font-semibold text-green-600">
                  -{previousSnapshot.bodyFat - latestSnapshot.bodyFat}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Body Fat Change
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SnapshotTimelineDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        userId={user.id}
      />
    </>
  )
}
