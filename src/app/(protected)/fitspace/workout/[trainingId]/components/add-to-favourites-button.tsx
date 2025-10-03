'use client'

import { BookmarkCheckIcon, BookmarkIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GQLFitspaceGetWorkoutDayQuery } from '@/generated/graphql-client'
import {
  useCreateFavouriteWorkout,
  useFavouriteWorkouts,
} from '@/hooks/use-favourite-workouts'

interface AddToFavouritesButtonProps {
  day: NonNullable<GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']>['day']
}

export function AddToFavouritesButton({ day }: AddToFavouritesButtonProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const { data: favouritesData } = useFavouriteWorkouts()
  const { mutateAsync: createFavourite, isPending: isCreating } =
    useCreateFavouriteWorkout()

  const exercises = day.exercises

  // Check if current workout is already saved as favourite
  const isAlreadyFavourite = useMemo(() => {
    if (!favouritesData?.getFavouriteWorkouts || exercises.length === 0) {
      return false
    }

    // Get current workout exercise base IDs
    const currentExerciseIds = exercises
      .map((ex) => ex.baseId)
      .filter(Boolean)
      .sort()

    // Check if any favourite has the exact same exercises
    return favouritesData.getFavouriteWorkouts.some((fav) => {
      const favExerciseIds = fav.exercises
        .map((ex) => ex.baseId)
        .filter(Boolean)
        .sort()

      // Compare arrays
      if (currentExerciseIds.length !== favExerciseIds.length) {
        return false
      }

      return currentExerciseIds.every(
        (id, index) => id === favExerciseIds[index],
      )
    })
  }, [favouritesData, exercises])

  const handleSave = async () => {
    if (!title.trim() || exercises.length === 0) return

    try {
      // Transform day exercises to favourite workout format
      const favouriteExercises = exercises.map((exercise, index) => ({
        name: exercise.name,
        order: index + 1,
        baseId: exercise.baseId || undefined,
        restSeconds: exercise.restSeconds || null,
        description: exercise.description || null,
        instructions: exercise.instructions || [],
        tips: exercise.tips || [],
        difficulty: exercise.difficulty || null,
        sets: exercise.sets.map((set, setIndex) => ({
          order: setIndex + 1,
          reps: set.reps || null,
          minReps: set.minReps || null,
          maxReps: set.maxReps || null,
          weight: set.weight || null,
          rpe: set.rpe || null,
        })),
      }))

      await createFavourite({
        input: {
          title: title.trim(),
          description: description.trim() || null,
          exercises: favouriteExercises,
        },
      })

      // Reset and close
      setTitle('')
      setDescription('')
      setOpen(false)
    } catch (error) {
      console.error('Failed to save favourite workout:', error)
    }
  }

  // Don't show button if already a favourite or no exercises
  if (isAlreadyFavourite || exercises.length === 0) {
    return null
  }

  return (
    <>
      <Button
        variant="secondary"
        iconStart={<BookmarkIcon />}
        onClick={() => setOpen(true)}
        className="w-full"
      >
        Add to Favourites
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent
          dialogTitle="Save as Favourite Workout"
          className="max-h-[85vh]"
        >
          <DrawerHeader>
            <DrawerTitle>Save as Favourite Workout</DrawerTitle>
            <DrawerDescription>
              Give this workout a name so you can easily find and reuse it later
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="title">Workout Name *</Label>
              <Input
                id="title"
                placeholder="e.g., Upper Body Strength"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add notes about this workout..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}{' '}
              will be saved
            </div>
          </div>

          <DrawerFooter>
            <Button
              variant="tertiary"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || isCreating}
              loading={isCreating}
              iconStart={<BookmarkCheckIcon />}
            >
              Save to Favourites
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
