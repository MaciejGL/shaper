'use client'

import { ChevronRight, Folder } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { GQLGetFavouriteWorkoutFoldersQuery } from '@/generated/graphql-client'

interface FolderCardProps {
  folder: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutFoldersQuery>['getFavouriteWorkoutFolders']
  >[number]
  onClick: () => void
}

export function FolderCard({ folder, onClick }: FolderCardProps) {
  const workoutCount = folder.favouriteWorkouts?.length ?? 0

  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 group active:scale-[0.98] transition-all duration-200 shadow-md border-transparent py-2"
      onClick={onClick}
    >
      <CardContent className="px-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-center size-20 rounded-xl bg-primary/10 text-primary shrink-0">
              <Folder className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{folder.name}</h3>
              <p className="text-sm text-muted-foreground">
                {workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'}
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </CardContent>
    </Card>
  )
}
