import { Copy, Edit, Trash2 } from 'lucide-react'

import { AnimatedGridItem } from '@/components/animated-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { TrainingPlanFormData } from '../types'

type WeekCardProps = {
  week: TrainingPlanFormData['weeks'][number]
  weeks: TrainingPlanFormData['weeks']
  cloneWeek: (index: number) => void
  openEditWeekDialog: (index: number) => void
  removeWeek: (index: number) => void
  index: number
  isFirstRender: boolean
}

export function WeekCard({
  week,
  weeks,
  cloneWeek,
  openEditWeekDialog,
  removeWeek,
  index,
  isFirstRender,
}: WeekCardProps) {
  return (
    <AnimatedGridItem
      id={week.weekNumber.toString()}
      layoutId={`week-${week.weekNumber}`}
      isFirstRender={isFirstRender}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{week.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => cloneWeek(index)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => openEditWeekDialog(index)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => removeWeek(index)}
              disabled={weeks.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {week.days.filter((d) => !d.isRestDay).length} training days
          </div>
          {week.description && (
            <div className="mt-2 text-sm">{week.description}</div>
          )}
        </CardContent>
      </Card>
    </AnimatedGridItem>
  )
}
