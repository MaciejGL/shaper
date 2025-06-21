'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { BackBodyView } from './body-back'
import { FrontBodyView } from './body-front/body-front'

interface EnhancedBodyViewProps {
  selectedMuscleGroups: string[]
  onMuscleGroupClick: (muscleGroupId: string) => void
  muscleGroups: { id: string; alias?: string | null; groupSlug: string }[]
  className?: string
}

export function EnhancedBodyView({
  selectedMuscleGroups = [],
  onMuscleGroupClick,
  muscleGroups = [],
}: EnhancedBodyViewProps) {
  if (!onMuscleGroupClick) {
    return (
      <div className="flex justify-center">
        <div className="text-muted-foreground">Loading body map...</div>
      </div>
    )
  }

  return (
    <Tabs>
      <TabsList className="w-full">
        <TabsTrigger value="front">Front</TabsTrigger>
        <TabsTrigger value="back">Back</TabsTrigger>
      </TabsList>

      <TabsContent value="front" className="flex flex-col items-center pt-4">
        <FrontBodyView
          selectedMuscleGroups={selectedMuscleGroups}
          onMuscleGroupClick={onMuscleGroupClick}
          muscleGroups={muscleGroups}
        />
        <div className="text-center text-sm text-muted-foreground">
          Click muscle groups to filter exercises
        </div>
      </TabsContent>
      <TabsContent value="back" className="flex flex-col items-center">
        <BackBodyView
          selectedMuscleGroups={selectedMuscleGroups}
          onMuscleGroupClick={onMuscleGroupClick}
          muscleGroups={muscleGroups}
        />
        <div className="text-center text-sm text-muted-foreground">
          Click muscle groups to filter exercises
        </div>
      </TabsContent>
    </Tabs>
  )
}
