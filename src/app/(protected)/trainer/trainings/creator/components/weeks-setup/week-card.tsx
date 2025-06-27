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
      <Card className="h-full bg-card-on-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{week.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => cloneWeek(index)}
              iconOnly={<Copy />}
            />
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => openEditWeekDialog(index)}
              iconOnly={<Edit />}
            />
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => removeWeek(index)}
              disabled={weeks.length <= 1}
              iconOnly={<Trash2 />}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {week.days.filter((d) => !d.isRestDay).length} training days
          </div>
          {week.description && (
            <p className="mt-2 text-sm whitespace-pre-wrap">
              {week.description}
            </p>
          )}
        </CardContent>
      </Card>
    </AnimatedGridItem>
  )
}
