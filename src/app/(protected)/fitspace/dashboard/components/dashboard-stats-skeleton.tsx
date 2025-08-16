'use client'

import {
  Activity,
  CalendarDaysIcon,
  Clock4Icon,
  DumbbellIcon,
} from 'lucide-react'

import { StatsItem } from '@/components/stats-item'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardStatsSkeleton() {
  return (
    <div className="space-y-6 -mx-2 md:-mx-0">
      <Card className="rounded-none border-none border-t border-b md:border md:rounded-lg py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 border-b border-border/50 pb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Workouts This Week</span>
              <span className="font-medium masked-placeholder-text">
                0 of 0 workouts
              </span>
            </div>
            <div className="overflow-x-auto scrollbar-hide py-2 -mx-4 px-4">
              <div className="flex gap-2">
                {/* Generate 7 skeleton day cards */}
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="shrink-0 last:pr-4">
                    <div className="day-card rounded-md shrink-0 p-3 min-w-[5rem] masked-placeholder-text">
                      <div className="flex-center flex-col gap-1 text-xs md:text-md text-center opacity-0">
                        <DumbbellIcon className="size-4 text-amber-600" />
                        <span className="masked-placeholder-text">Mon</span>
                        <span className="font-medium truncate ">Upper</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-4">
            <StatsItem
              value={<span className="masked-placeholder-text">0</span>}
              label="Day Streak"
              icon={<CalendarDaysIcon className="size-4 text-amber-500" />}
            />

            <StatsItem
              value={
                <div className="text-2xl font-bold masked-placeholder-text">
                  0<span className="text-xs text-muted-foreground">min</span>
                </div>
              }
              icon={<Clock4Icon className="size-4 text-blue-500" />}
              label="Gym time"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
