'use client'

import { useMemo } from 'react'

import { FemaleBodyBackView } from '@/components/human-body/female-body-back/female-body-back'
import { FemaleBodyFrontView } from '@/components/human-body/female-body-front/female-body-front'
import { MaleBodyBackView } from '@/components/human-body/male-body-back/male-body-back'
import { MaleBodyFrontView } from '@/components/human-body/male-body-front/male-body-front'
import { useUser } from '@/context/user-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { LABEL_TO_GROUP_MAPPING } from '../../../progress/constants/muscle-groups'

interface WorkoutTypeHeatmapProps {
  muscleGroups: string[]
  colorClassName?: string
}

export function WorkoutTypeHeatmap({
  muscleGroups,
  colorClassName = 'fill-primary',
}: WorkoutTypeHeatmapProps) {
  const { user } = useUser()
  const isMale = user?.profile?.sex !== 'Female'

  const muscleIntensity = useMemo(() => {
    const intensity: Record<string, number> = {}
    muscleGroups.forEach((muscle) => {
      intensity[muscle] = 80
    })
    return intensity
  }, [muscleGroups])

  const getPathProps = (aliases: string[]) => {
    let muscleGroupName: string | null = null
    for (const alias of aliases) {
      if (LABEL_TO_GROUP_MAPPING[alias]) {
        muscleGroupName = LABEL_TO_GROUP_MAPPING[alias]
        break
      }
    }

    const intensity = muscleGroupName
      ? muscleIntensity[muscleGroupName] || 0
      : 0

    return {
      className: cn(
        'transition-all duration-200 pointer-events-none',
        intensity > 0 ? colorClassName : 'fill-muted',
      ),
      onClick: () => {},
    }
  }

  const FrontView = isMale ? MaleBodyFrontView : FemaleBodyFrontView
  const BackView = isMale ? MaleBodyBackView : FemaleBodyBackView

  return (
    <div>
      <Tabs defaultValue="front">
        <TabsList className="mx-auto border dark:border-0 border-border grid grid-cols-[1fr_auto_1fr]">
          <TabsTrigger value="front" className="text-xs sm:text-sm">
            Front
          </TabsTrigger>
          <TabsTrigger value="swap" disabled>
            <svg
              className="size-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 3L4 7l4 4" />
              <path d="M4 7h16" />
              <path d="m16 21 4-4-4-4" />
              <path d="M20 17H4" />
            </svg>
          </TabsTrigger>
          <TabsTrigger value="back" className="text-xs sm:text-sm">
            Back
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="front"
          className="flex flex-col items-center scale-100 sm:scale-90"
        >
          <FrontView getPathProps={getPathProps} />
        </TabsContent>

        <TabsContent value="back" className="flex flex-col items-center">
          <BackView getPathProps={getPathProps} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
