'use client'

import { BarChart3, ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'

import { MuscleLogsDrawer } from './muscle-logs-drawer'

export function LogsSection() {
  const { user } = useUser()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Placeholder data - will be replaced with real data in Phase 3
  // const weightProgress = [
  //   { date: '2024-01-01', weight: 75 },
  //   { date: '2024-01-08', weight: 76 },
  //   { date: '2024-01-15', weight: 75.5 },
  //   { date: '2024-01-22', weight: 77 },
  //   { date: '2024-01-29', weight: 76.5 },
  // ]

  if (!user) {
    return null
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Progress Logs
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              iconStart={<Plus className="h-4 w-4" />}
            >
              Add Log
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              iconEnd={<ChevronRight className="h-4 w-4" />}
            >
              View More
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Weight Progress Chart Placeholder */}
            <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Weight Progress Chart</p>
                <p className="text-xs">Last 30 days</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-card-on-card rounded-lg">
                <div className="text-lg font-semibold">77.0 kg</div>
                <div className="text-xs text-muted-foreground">
                  Current Weight
                </div>
              </div>
              <div className="text-center p-3 bg-card-on-card rounded-lg">
                <div className="text-lg font-semibold text-green-600">
                  +2.0 kg
                </div>
                <div className="text-xs text-muted-foreground">This Month</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MuscleLogsDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        userId={user.id}
      />
    </>
  )
}
