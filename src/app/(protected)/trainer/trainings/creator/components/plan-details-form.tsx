'use client'

import { format, formatRelative } from 'date-fns'
import {
  AlertCircle,
  Clock,
  Eye,
  FileText,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiImageUpload } from '@/components/ui/multi-image-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { GQLDifficulty } from '@/generated/graphql-client'
import { useAutoSyncedInput } from '@/hooks/use-auto-synced-input'
import { cn } from '@/lib/utils'

import { FocusTagsSelector } from './focus-tags-selector'
import { TargetGoalsSelector } from './target-goals-selector'

const DIFFICULTIES: { label: string; value: GQLDifficulty }[] = [
  { label: 'Beginner', value: GQLDifficulty.Beginner },
  { label: 'Intermediate', value: GQLDifficulty.Intermediate },
  { label: 'Advanced', value: GQLDifficulty.Advanced },
  { label: 'Expert', value: GQLDifficulty.Expert },
]

export function PlanDetailsForm() {
  // Use unified training plan context instead of props
  const { formData, createdAt, updatedAt, assignedCount } = useTrainingPlan()

  // Early return if no data is loaded
  if (!formData) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <PlanDetailsHeader />
      </div>
      {!formData.details.assignedTo && (
        <div className="w-full gap-6">
          <PlanPublicications
            createdAt={createdAt}
            updatedAt={updatedAt}
            assignedCount={assignedCount}
          />
        </div>
      )}
    </div>
  )
}

function PlanDetailsHeader() {
  // Use unified training plan context
  const { formData, updateDetails } = useTrainingPlan()

  // Call hooks unconditionally
  const titleInput = useAutoSyncedInput(
    formData?.details.title || '',
    (value) => updateDetails({ title: value }),
    500, // 500ms debounce for title
  )

  const descriptionInput = useAutoSyncedInput(
    formData?.details.description ?? '',
    (value) => updateDetails({ description: value }),
    700, // 700ms debounce for description (longer text)
  )

  // Early return after hooks
  if (!formData) return null

  const data = formData.details

  const isDisabled = !!data.completedAt

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Basic Information
        </CardTitle>
        <CardDescription>
          Set up the fundamental details of your training plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Plan Title</Label>
            <Input
              id="title"
              placeholder="e.g., Upper Body Strength Program"
              value={titleInput.value}
              onChange={(e) => titleInput.onChange(e.target.value)}
              onFocus={titleInput.onFocus}
              onBlur={titleInput.onBlur}
              className="w-full"
              disabled={isDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={data.difficulty ?? ''}
              onValueChange={(value: GQLDifficulty) =>
                updateDetails({ difficulty: value })
              }
              disabled={isDisabled}
            >
              <SelectTrigger variant="default">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((difficulty) => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the goals, target audience, and key features of this training plan..."
            variant="ghost"
            value={descriptionInput.value}
            onChange={(e) => descriptionInput.onChange(e.target.value)}
            onFocus={descriptionInput.onFocus}
            onBlur={descriptionInput.onBlur}
            className="min-h-[120px] resize-none"
            disabled={isDisabled}
          />
          <p className="text-xs text-muted-foreground">
            Help clients understand what this plan offers and who it's designed
            for
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FocusTagsSelector
            selected={data.focusTags || []}
            onChange={(focusTags) => updateDetails({ focusTags })}
            disabled={isDisabled}
          />
          <TargetGoalsSelector
            selected={data.targetGoals || []}
            onChange={(targetGoals) => updateDetails({ targetGoals })}
            disabled={isDisabled}
          />
        </div>

        <Separator />

        <HeroImageSection disabled={isDisabled} />
      </CardContent>
    </Card>
  )
}

function HeroImageSection({ disabled }: { disabled: boolean }) {
  const { formData, updateDetails } = useTrainingPlan()
  const [uploadKey, setUploadKey] = useState(0)
  const [imageSource, setImageSource] = useState<'exercise' | 'custom'>(
    'exercise',
  )

  // Extract exercise images from plan data
  const exerciseImages = useMemo(() => {
    if (!formData?.weeks) return []

    const images: Array<{ url: string; exerciseName: string }> = []
    const seenUrls = new Set<string>() // Avoid duplicates

    formData.weeks.forEach((week) => {
      week.days?.forEach((day) => {
        day.exercises?.forEach((exercise: any) => {
          // Get images directly from exercise
          exercise.images?.forEach((img: any) => {
            if (img.url && !seenUrls.has(img.url)) {
              seenUrls.add(img.url)
              images.push({
                url: img.url,
                exerciseName: exercise.name,
              })
            }
          })
        })
      })
    })
    return images
  }, [formData])

  // Early return after all hooks
  if (!formData) return null

  const heroImageUrl = formData.details.heroImageUrl || ''
  const isPublic =
    formData.details.isPublic || !formData.details.isDraft || false
  const isImageEditDisabled = disabled || isPublic

  const handleImageUpload = (urls: string[]) => {
    updateDetails({ heroImageUrl: urls[0] || '' })
  }

  const handleRemoveImage = () => {
    updateDetails({ heroImageUrl: '' })
    // Force MultiImageUpload to re-render with empty images
    setUploadKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Hero Image</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Add a cover image that represents your training plan. This will be
          displayed on explore page.
        </p>
        {isPublic && (
          <Alert className="mt-2" variant="warning">
            <AlertDescription>
              Hero image cannot be changed while the plan is public. Set the
              plan to private to edit the image.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Preview Section - Always on top */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Preview</Label>
        {heroImageUrl ? (
          <div className="max-w-md">
            <TrainingPlanPreviewCard
              title={formData.details.title}
              difficulty={formData.details.difficulty}
              weekCount={formData.weeks.length}
              heroImageUrl={heroImageUrl}
            />
          </div>
        ) : (
          <Card className="max-w-md">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                Select or upload an image to see preview
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Selection Tabs */}
      {!isImageEditDisabled && (
        <Tabs
          value={imageSource}
          onValueChange={(value) =>
            setImageSource(value as 'exercise' | 'custom')
          }
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="exercise">
              Exercise Images ({exerciseImages.length})
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Upload className="w-4 h-4 mr-2" />
              Upload Custom
            </TabsTrigger>
          </TabsList>

          {/* Exercise Images Tab */}
          <TabsContent value="exercise" className="space-y-3">
            <Label>Select from exercise images:</Label>
            {exerciseImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
                {exerciseImages.map((img, index) => (
                  <div
                    key={index}
                    className={cn(
                      'relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all',
                      heroImageUrl === img.url
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-border hover:border-primary/50',
                    )}
                    onClick={() => updateDetails({ heroImageUrl: img.url })}
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
                    No exercise images available yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add exercises with images to your plan first, or upload a
                    custom image
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Custom Upload Tab */}
          <TabsContent value="custom" className="space-y-3">
            <Label>Upload custom hero image:</Label>
            <MultiImageUpload
              key={uploadKey}
              imageType="exercise"
              currentImageUrls={heroImageUrl ? [heroImageUrl] : []}
              onImagesChange={handleImageUpload}
              maxImages={1}
            />
            <p className="text-xs text-muted-foreground">
              Upload a high-quality image that represents this training plan
            </p>
          </TabsContent>
        </Tabs>
      )}

      {/* Remove Button */}
      {heroImageUrl && !isImageEditDisabled && (
        <Button
          size="sm"
          variant="destructive"
          onClick={handleRemoveImage}
          iconStart={<X />}
          className="max-w-md"
        >
          Remove Image
        </Button>
      )}
    </div>
  )
}

function PlanPublicications({
  createdAt,
  updatedAt,
  assignedCount,
}: {
  createdAt?: string
  updatedAt?: string
  assignedCount?: number
}) {
  // Use unified training plan context
  const { formData, updateDetails } = useTrainingPlan()

  if (!formData) return null

  const data = formData.details
  const isDraft = data.isDraft ?? false
  const setIsDraft = (value: boolean) => updateDetails({ isDraft: value })
  const isDisabled = !!data.completedAt

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Publication Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="draft-toggle" className="text-sm font-medium">
              Draft Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              {isDraft
                ? "Plan is private and can't be assigned"
                : 'Plan is live and available to clients'}
            </p>
          </div>
          <Switch
            id="draft-toggle"
            checked={isDraft}
            onCheckedChange={setIsDraft}
            disabled={isDisabled}
          />
        </div>

        {isDraft && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This plan is in draft mode and won't be assignable to clients
              until published.
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            {createdAt && (
              <span>{format(new Date(createdAt), 'd MMM HH:mm')}</span>
            )}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last modified</span>
            {updatedAt && (
              <span>{formatRelative(new Date(updatedAt), new Date())}</span>
            )}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Assigned clients</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {assignedCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Preview card component
interface TrainingPlanPreviewCardProps {
  title: string
  difficulty?: string | null
  weekCount: number
  heroImageUrl: string
}

function TrainingPlanPreviewCard({
  title,
  difficulty,
  weekCount,
  heroImageUrl,
}: TrainingPlanPreviewCardProps) {
  const difficultyVariantMap = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert',
  } as const

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
        <CardTitle className="text-2xl text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            {difficulty && (
              <Badge
                variant={
                  difficultyVariantMap[
                    difficulty as keyof typeof difficultyVariantMap
                  ]
                }
                className="capitalize"
                size="lg"
              >
                {difficulty.toLowerCase()}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3 text-xs text-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {weekCount} weeks
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
