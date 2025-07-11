import { Calendar } from 'lucide-react'

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { DayCard } from './day-card'

interface Week {
  id: string
  weekNumber: number
  name?: string | null
  days?: Day[] | null
}

interface Day {
  id: string
  dayOfWeek: number
  targetCalories?: number | null
  targetProtein?: number | null
  targetCarbs?: number | null
  targetFat?: number | null
  meals?: Meal[] | null
}

interface Meal {
  id: string
  name: string
  dateTime: string
  instructions?: string | null
  foods?: Food[] | null
}

interface Food {
  id: string
  name: string
  quantity: number
  unit: string
}

interface MealScheduleProps {
  weeks: Week[]
}

export function MealSchedule({ weeks }: MealScheduleProps) {
  return (
    <div className="space-y-4">
      {weeks.map((week) => (
        <div key={week.id}>
          <CardHeader className="px-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="size-4" />
              Week {week.weekNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-3">
              {week.days && week.days.length > 0 ? (
                week.days.map((day) => <DayCard key={day.id} day={day} />)
              ) : (
                <div className="text-sm text-muted-foreground">
                  No days planned
                </div>
              )}
            </div>
          </CardContent>
        </div>
      ))}
    </div>
  )
}
