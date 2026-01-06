'use client'

import { Eye, EyeOff, Plus, Trash2, Upload, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { MultiImageUpload } from '@/components/ui/multi-image-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useAddFreeWorkoutDayMutation,
  useGetAdminFreeWorkoutDaysQuery,
  useGetPublicTrainingPlanWeeksForAdminQuery,
  useGetPublicTrainingPlansQuery,
  useRemoveFreeWorkoutDayMutation,
  useUpdateFreeWorkoutDayMutation,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { estimateWorkoutTime } from '@/lib/workout/estimate-workout-time'
import { formatUserCount } from '@/utils/format-user-count'

export function FreeWorkoutDaysAdmin() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFreeWorkoutId, setEditingFreeWorkoutId] = useState<
    string | null
  >(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [selectedDayId, setSelectedDayId] = useState<string>('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [imageSource, setImageSource] = useState<'exercise' | 'custom'>(
    'exercise',
  )

  const { data, isLoading, refetch } = useGetAdminFreeWorkoutDaysQuery({})
  const { data: plansData } = useGetPublicTrainingPlansQuery({ limit: 100 })
  const { data: planWeeksData } = useGetPublicTrainingPlanWeeksForAdminQuery(
    { planId: selectedPlanId },
    { enabled: !!selectedPlanId },
  )

  const { mutateAsync: addWorkoutDay, isPending: isAdding } =
    useAddFreeWorkoutDayMutation({})

  const { mutateAsync: updateWorkoutDay } = useUpdateFreeWorkoutDayMutation({})

  const { mutateAsync: removeWorkoutDay } = useRemoveFreeWorkoutDayMutation({})

  const freeWorkoutDays = data?.getAdminFreeWorkoutDays || []
  const plans = plansData?.getPublicTrainingPlans || []
  const selectedPlanWeeks = planWeeksData?.getTrainingPlanById?.weeks || []

  // Get selected day data and available exercise images
  const selectedDayData = useMemo(() => {
    if (!selectedDayId || !selectedPlanWeeks.length) return null

    for (const week of selectedPlanWeeks) {
      const day = week.days?.find((d) => d.id === selectedDayId)
      if (day) {
        return {
          ...day,
          weekNumber: week.weekNumber,
        }
      }
    }
    return null
  }, [selectedDayId, selectedPlanWeeks])

  // Extract exercise images from selected day
  const exerciseImages = useMemo(() => {
    if (!selectedDayData?.exercises) return []

    const images: { url: string; exerciseName: string }[] = []
    selectedDayData.exercises.forEach((exercise) => {
      exercise.images?.forEach((img) => {
        if (img.url) {
          images.push({
            url: img.url,
            exerciseName: exercise.name,
          })
        }
      })
    })
    return images
  }, [selectedDayData])

  // Get selected plan data
  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId)
  }, [plans, selectedPlanId])

  // Calculate estimated duration
  const estimatedDuration = useMemo(() => {
    if (!selectedDayData?.exercises) return null
    return estimateWorkoutTime(selectedDayData.exercises)
  }, [selectedDayData])

  const handleAdd = async () => {
    if (!selectedDayId || !selectedPlanId) {
      toast.error('Please select a plan and workout day')
      return
    }

    if (!heroImageUrl) {
      toast.error('Please select or upload a hero image')
      return
    }

    try {
      await addWorkoutDay({
        input: {
          trainingDayId: selectedDayId,
          planId: selectedPlanId,
          heroImageUrl,
        },
      })
      toast.success('Free workout day added')
      setIsAddDialogOpen(false)
      setSelectedPlanId('')
      setSelectedDayId('')
      setHeroImageUrl('')
      setImageSource('exercise')
      refetch()
    } catch (error) {
      console.error('Failed to add free workout day:', error)
      toast.error('Failed to add free workout day')
    }
  }

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      await updateWorkoutDay({
        id,
        isVisible: !isVisible,
      })
      toast.success(`Workout day ${!isVisible ? 'shown' : 'hidden'}`)
      refetch()
    } catch (error) {
      console.error('Failed to update visibility:', error)
      toast.error('Failed to update visibility')
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this free workout day?')) {
      return
    }

    try {
      await removeWorkoutDay({ id })
      toast.success('Free workout day removed')
      refetch()
    } catch (error) {
      console.error('Failed to remove free workout day:', error)
      toast.error('Failed to remove free workout day')
    }
  }

  const handleEdit = (freeWorkoutDay: (typeof freeWorkoutDays)[number]) => {
    setEditingFreeWorkoutId(freeWorkoutDay.id)
    setSelectedPlanId(freeWorkoutDay.planId)
    setSelectedDayId(freeWorkoutDay.trainingDayId)
    setHeroImageUrl(freeWorkoutDay.heroImageUrl || '')
    setImageSource(freeWorkoutDay.heroImageUrl ? 'exercise' : 'custom')
    setIsEditDialogOpen(true)
  }

  const handleUpdateImage = async () => {
    if (!editingFreeWorkoutId || !heroImageUrl) {
      toast.error('Please select an image')
      return
    }

    try {
      await updateWorkoutDay({
        id: editingFreeWorkoutId,
        heroImageUrl,
      })
      toast.success('Hero image updated')
      setIsEditDialogOpen(false)
      setEditingFreeWorkoutId(null)
      setSelectedPlanId('')
      setSelectedDayId('')
      setHeroImageUrl('')
      setImageSource('exercise')
      refetch()
    } catch (error) {
      console.error('Failed to update hero image:', error)
      toast.error('Failed to update hero image')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton count={3} variant="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Free Workout Days</h3>
          <p className="text-sm text-muted-foreground">
            Manage which workout days are available for free trials
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} iconStart={<Plus />}>
          Add Workout Day
        </Button>
      </div>

      <div className="grid gap-4">
        {freeWorkoutDays.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No free workout days configured yet
              </p>
            </CardContent>
          </Card>
        ) : (
          freeWorkoutDays.map((day) => {
            const workoutType = day.trainingDay?.workoutType || 'Workout'
            const planTitle = day.plan?.title || 'Unknown Plan'
            const exercisesCount = day.trainingDay?.exercisesCount || 0

            return (
              <Card key={day.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base">{workoutType}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        from {planTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={day.isVisible ? 'primary' : 'secondary'}>
                        {day.isVisible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">
                        {exercisesCount} exercises
                      </p>
                      {day.heroImageUrl && (
                        <p className="text-xs text-muted-foreground">
                          Has hero image
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="tertiary"
                        onClick={() => handleEdit(day)}
                        iconStart={<Upload />}
                      >
                        Edit Image
                      </Button>
                      <Button
                        size="sm"
                        variant="tertiary"
                        onClick={() =>
                          handleToggleVisibility(day.id, day.isVisible)
                        }
                        iconOnly={day.isVisible ? <EyeOff /> : <Eye />}
                      />
                      <Button
                        size="sm"
                        variant="tertiary"
                        onClick={() => handleRemove(day.id)}
                        iconOnly={<Trash2 />}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent
          dialogTitle="Add Free Workout Day"
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Add Free Workout Day</DialogTitle>
            <DialogDescription>
              Select a training plan, workout day, and hero image
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Plan and Day Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Training Plan</Label>
                <Select
                  value={selectedPlanId}
                  onValueChange={(value) => {
                    setSelectedPlanId(value)
                    setSelectedDayId('')
                    setHeroImageUrl('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlanId && selectedPlanWeeks.length > 0 && (
                <div className="space-y-2">
                  <Label>Workout Day</Label>
                  <Select
                    value={selectedDayId}
                    onValueChange={(value) => {
                      setSelectedDayId(value)
                      setHeroImageUrl('')
                      setImageSource('exercise')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedPlanWeeks.flatMap((week) =>
                        week.days
                          ?.filter((day) => !day.isRestDay)
                          .map((day) => (
                            <SelectItem key={day.id} value={day.id}>
                              Week {week.weekNumber} -{' '}
                              {day.workoutType || 'Workout'}
                            </SelectItem>
                          )),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Image Selection and Preview */}
            {selectedDayId && selectedDayData && (
              <div className="space-y-4 pt-4 border-t">
                <Tabs
                  value={imageSource}
                  onValueChange={(value) => {
                    setImageSource(value as 'exercise' | 'custom')
                  }}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="exercise">
                      Exercise Images ({exerciseImages.length})
                    </TabsTrigger>
                    <TabsTrigger value="custom">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Custom
                    </TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>

                  {/* Exercise Images Tab */}
                  <TabsContent value="exercise" className="space-y-3">
                    <Label>Select from exercise images:</Label>
                    {exerciseImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                        {exerciseImages.map((img, index) => (
                          <div
                            key={index}
                            className={cn(
                              'relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all',
                              heroImageUrl === img.url
                                ? 'border-primary ring-2 ring-primary'
                                : 'border-border hover:border-primary/50',
                            )}
                            onClick={() => setHeroImageUrl(img.url)}
                          >
                            <img
                              src={img.url}
                              alt={img.exerciseName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <p className="text-white text-xs font-medium truncate">
                                {img.exerciseName}
                              </p>
                            </div>
                            {heroImageUrl === img.url && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                <Eye className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-muted-foreground text-sm">
                            No exercise images available for this workout day
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Try uploading a custom image instead
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Custom Upload Tab */}
                  <TabsContent value="custom" className="space-y-3">
                    <Label>Upload custom hero image:</Label>
                    <MultiImageUpload
                      imageType="exercise"
                      currentImageUrls={heroImageUrl ? [heroImageUrl] : []}
                      onImagesChange={(urls) => setHeroImageUrl(urls[0] || '')}
                      maxImages={1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload a high-quality image that represents this workout
                    </p>
                  </TabsContent>

                  {/* Preview Tab */}
                  <TabsContent value="preview" className="space-y-3">
                    <Label>Preview how it will look:</Label>
                    {heroImageUrl ? (
                      <FreeWorkoutPreviewCard
                        workoutType={selectedDayData.workoutType || 'Workout'}
                        planTitle={selectedPlan?.title || 'Training Plan'}
                        exerciseCount={selectedDayData.exercises?.length || 0}
                        estimatedDuration={estimatedDuration}
                        heroImageUrl={heroImageUrl}
                        timesStarted={selectedDayData.timesStarted || 0}
                      />
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-muted-foreground text-sm">
                            Select or upload an image to see preview
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="tertiary">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAdd}
              disabled={isAdding || !selectedDayId || !heroImageUrl}
              loading={isAdding}
            >
              Add Workout Day
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          dialogTitle="Edit Free Workout Hero Image"
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Edit Free Workout Hero Image</DialogTitle>
            <DialogDescription>
              Change the hero image for this free workout
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Selection and Preview */}
            {selectedDayId && selectedDayData && (
              <div className="space-y-4">
                <Tabs
                  value={imageSource}
                  onValueChange={(value) => {
                    setImageSource(value as 'exercise' | 'custom')
                  }}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="exercise">
                      Exercise Images ({exerciseImages.length})
                    </TabsTrigger>
                    <TabsTrigger value="custom">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Custom
                    </TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>

                  {/* Exercise Images Tab */}
                  <TabsContent value="exercise" className="space-y-3">
                    <Label>Select from exercise images:</Label>
                    {exerciseImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                        {exerciseImages.map((img, index) => (
                          <div
                            key={index}
                            className={cn(
                              'relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all',
                              heroImageUrl === img.url
                                ? 'border-primary ring-2 ring-primary'
                                : 'border-border hover:border-primary/50',
                            )}
                            onClick={() => setHeroImageUrl(img.url)}
                          >
                            <img
                              src={img.url}
                              alt={img.exerciseName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <p className="text-white text-xs font-medium truncate">
                                {img.exerciseName}
                              </p>
                            </div>
                            {heroImageUrl === img.url && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                <Eye className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-muted-foreground text-sm">
                            No exercise images available for this workout day
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Try uploading a custom image instead
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Custom Upload Tab */}
                  <TabsContent value="custom" className="space-y-3">
                    <Label>Upload custom hero image:</Label>
                    <MultiImageUpload
                      imageType="exercise"
                      currentImageUrls={heroImageUrl ? [heroImageUrl] : []}
                      onImagesChange={(urls) => setHeroImageUrl(urls[0] || '')}
                      maxImages={1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload a high-quality image that represents this workout
                    </p>
                  </TabsContent>

                  {/* Preview Tab */}
                  <TabsContent value="preview" className="space-y-3">
                    <Label>Preview how it will look:</Label>
                    {heroImageUrl ? (
                      <FreeWorkoutPreviewCard
                        workoutType={selectedDayData.workoutType || 'Workout'}
                        planTitle={selectedPlan?.title || 'Training Plan'}
                        exerciseCount={selectedDayData.exercises?.length || 0}
                        estimatedDuration={estimatedDuration}
                        heroImageUrl={heroImageUrl}
                        timesStarted={selectedDayData.timesStarted || 0}
                      />
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-muted-foreground text-sm">
                            Select or upload an image to see preview
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="tertiary">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleUpdateImage}
              disabled={!heroImageUrl}
              loading={false}
            >
              Update Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface FreeWorkoutPreviewCardProps {
  workoutType: string
  planTitle: string
  exerciseCount: number
  estimatedDuration: number | null
  heroImageUrl: string
  timesStarted: number
}

function FreeWorkoutPreviewCard({
  workoutType,
  planTitle,
  exerciseCount,
  estimatedDuration,
  heroImageUrl,
  timesStarted,
}: FreeWorkoutPreviewCardProps) {
  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-all overflow-hidden group relative dark">
      {heroImageUrl && (
        <div className="absolute inset-0 opacity-100 group-hover:opacity-30 transition-opacity">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImageUrl})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        </div>
      )}

      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl text-foreground">
              {workoutType}
            </CardTitle>
            <p className="text-sm text-foreground">
              <span className="font-medium">{planTitle}</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span>{exerciseCount} exercises</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            {estimatedDuration && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span>{estimatedDuration} mins workout</span>
              </div>
            )}
            {timesStarted > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{formatUserCount(timesStarted)} started</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
