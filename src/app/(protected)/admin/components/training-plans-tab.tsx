'use client'

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  Search,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiImageUpload } from '@/components/ui/multi-image-upload'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { estimateWorkoutTime } from '@/lib/workout/esimate-workout-time'
import { formatUserCount } from '@/utils/format-user-count'

interface TrainingPlanCreator {
  id: string
  name?: string | null
  profile?: {
    firstName?: string | null
    lastName?: string | null
  } | null
}

interface AdminTrainingPlanItem {
  id: string
  title: string
  description?: string | null
  isPublic: boolean
  premium: boolean
  isDraft: boolean
  createdAt: string
  updatedAt: string
  createdBy: TrainingPlanCreator
}

interface TrainingPlansResponse {
  plans: AdminTrainingPlanItem[]
  total: number
  hasMore: boolean
}

export function TrainingPlansTab() {
  const [plans, setPlans] = useState<AdminTrainingPlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')

  // Pagination
  const [offset, setOffset] = useState(0)
  const limit = 20

  // Hero image management
  const [isEditImageDialogOpen, setIsEditImageDialogOpen] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [imageSource, setImageSource] = useState<'exercise' | 'custom'>(
    'exercise',
  )
  const [planData, setPlanData] = useState<any>(null)
  const [loadingPlanData, setLoadingPlanData] = useState(false)

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (search) params.append('search', search)

      const response = await fetch(`/api/admin/training-plans?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch training plans')
      }

      const data: TrainingPlansResponse = await response.json()
      setPlans(data.plans)
      setTotal(data.total)
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('Error fetching training plans:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch training plans',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, search])

  const handleNextPage = () => {
    if (hasMore) {
      setOffset(offset + limit)
    }
  }

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit))
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setOffset(0)
  }

  const handleToggle = async (
    planId: string,
    field: 'isPublic' | 'premium',
    currentValue: boolean,
  ) => {
    // Optimistic update
    setPlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === planId ? { ...plan, [field]: !currentValue } : plan,
      ),
    )

    try {
      const response = await fetch(`/api/admin/training-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentValue }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update ${field}`)
      }

      // Success - the optimistic update is correct
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      // Revert optimistic update
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === planId ? { ...plan, [field]: currentValue } : plan,
        ),
      )
      setError(
        error instanceof Error ? error.message : `Failed to update ${field}`,
      )
    }
  }

  const getCreatorName = (creator: TrainingPlanCreator) => {
    if (creator.profile?.firstName || creator.profile?.lastName) {
      return `${creator.profile.firstName || ''} ${creator.profile.lastName || ''}`.trim()
    }
    return creator.name || 'Unknown'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleEditImage = async (plan: AdminTrainingPlanItem) => {
    setEditingPlanId(plan.id)
    setLoadingPlanData(true)
    setIsEditImageDialogOpen(true)

    try {
      const response = await fetch(
        `/api/admin/training-plans/${plan.id}/exercises`,
      )
      if (!response.ok) throw new Error('Failed to load plan data')

      const data = await response.json()
      setPlanData(data)
      setHeroImageUrl(data.heroImageUrl || '')
      setImageSource(data.heroImageUrl ? 'exercise' : 'custom')
    } catch (error) {
      console.error('Failed to load plan data:', error)
      toast.error('Failed to load plan data')
    } finally {
      setLoadingPlanData(false)
    }
  }

  const handleUpdateHeroImage = async () => {
    if (!editingPlanId || !heroImageUrl) {
      toast.error('Please select an image')
      return
    }

    try {
      const response = await fetch(
        `/api/admin/training-plans/${editingPlanId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ heroImageUrl }),
        },
      )

      if (!response.ok) throw new Error('Failed to update hero image')

      toast.success('Hero image updated')
      setIsEditImageDialogOpen(false)
      setEditingPlanId(null)
      setPlanData(null)
      setHeroImageUrl('')
      setImageSource('exercise')
      fetchPlans()
    } catch (error) {
      console.error('Failed to update hero image:', error)
      toast.error('Failed to update hero image')
    }
  }

  // Extract exercise images from plan data
  const exerciseImages = useMemo(() => {
    if (!planData?.weeks) return []

    const images: Array<{ url: string; exerciseName: string }> = []
    planData.weeks.forEach((week: any) => {
      week.days?.forEach((day: any) => {
        day.exercises?.forEach((exercise: any) => {
          exercise.base?.images?.forEach((img: any) => {
            if (img.url) {
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
  }, [planData])

  // Calculate estimated duration
  const estimatedDuration = useMemo(() => {
    if (!planData?.weeks) return null

    const allExercises = planData.weeks.flatMap(
      (week: any) =>
        week.days?.flatMap((day: any) => day.exercises || []) || [],
    )

    if (allExercises.length === 0) return null
    return estimateWorkoutTime(allExercises)
  }, [planData])

  if (loading && plans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading training plans...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">All training plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {plans.filter((p) => p.isPublic).length}
            </div>
            <p className="text-xs text-muted-foreground">Public plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {plans.filter((p) => p.premium).length}
            </div>
            <p className="text-xs text-muted-foreground">Premium plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {plans.filter((p) => p.isDraft).length}
            </div>
            <p className="text-xs text-muted-foreground">Draft plans</p>
          </CardContent>
        </Card>
      </div>

      {/* Training Plans Management */}
      <Card>
        <CardHeader>
          <CardTitle>Training Plans Management</CardTitle>
          <CardDescription>
            Manage training plan visibility and premium status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="plan-search"
                  placeholder="Search plans by name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setOffset(0)
                  }}
                  className="pl-8"
                />
              </div>

              <Button variant="outline" onClick={handleResetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Plan Name
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Creator
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Type
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Published
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Premium
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Created
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Updated
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-muted/30">
                      <td className="border-b px-4 py-3">
                        <div>
                          <div className="font-medium">{plan.title}</div>
                          {plan.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {plan.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="border-b px-4 py-3 text-sm">
                        {getCreatorName(plan.createdBy)}
                      </td>
                      <td className="border-b px-4 py-3">
                        <Badge variant={plan.isDraft ? 'outline' : 'secondary'}>
                          {plan.isDraft ? 'Draft' : 'Published'}
                        </Badge>
                      </td>
                      <td className="border-b px-4 py-3">
                        <Badge variant={plan.premium ? 'premium' : 'secondary'}>
                          {plan.premium ? 'Premium' : 'Free'}
                        </Badge>
                      </td>
                      <td className="border-b px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={plan.isPublic}
                            onCheckedChange={() =>
                              handleToggle(plan.id, 'isPublic', plan.isPublic)
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            {plan.isPublic ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </td>
                      <td className="border-b px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={plan.premium}
                            onCheckedChange={() =>
                              handleToggle(plan.id, 'premium', plan.premium)
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            {plan.premium ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </td>
                      <td className="border-b px-4 py-3 text-sm">
                        {formatDate(plan.createdAt)}
                      </td>
                      <td className="border-b px-4 py-3 text-sm">
                        {formatDate(plan.updatedAt)}
                      </td>
                      <td className="border-b px-4 py-3">
                        <Button
                          size="sm"
                          variant="tertiary"
                          onClick={() => handleEditImage(plan)}
                          iconStart={<Upload />}
                        >
                          Edit Image
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of{' '}
                {total} plans
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {loading && plans.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Hero Image Dialog */}
      <Dialog
        open={isEditImageDialogOpen}
        onOpenChange={setIsEditImageDialogOpen}
      >
        <DialogContent
          dialogTitle="Edit Training Plan Hero Image"
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Edit Training Plan Hero Image</DialogTitle>
            <DialogDescription>
              Select an image from exercises or upload a custom one
            </DialogDescription>
          </DialogHeader>

          {loadingPlanData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading plan data...</span>
            </div>
          ) : (
            <div className="space-y-4 py-4">
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
                          No exercise images available for this plan
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
                    Upload a high-quality image that represents this training
                    plan
                  </p>
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview" className="space-y-3">
                  <Label>Preview how it will look:</Label>
                  {heroImageUrl && planData ? (
                    <TrainingPlanPreviewCard
                      title={planData.title}
                      difficulty={planData.difficulty}
                      weekCount={planData.weekCount}
                      assignmentCount={planData.assignmentCount}
                      premium={planData.premium}
                      heroImageUrl={heroImageUrl}
                      estimatedDuration={estimatedDuration}
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

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="tertiary">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleUpdateHeroImage}
              disabled={!heroImageUrl || loadingPlanData}
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

// Preview card component for the dialog
interface TrainingPlanPreviewCardProps {
  title: string
  difficulty?: string | null
  weekCount: number
  assignmentCount: number
  premium: boolean
  heroImageUrl: string
  estimatedDuration: number | null
}

function TrainingPlanPreviewCard({
  title,
  difficulty,
  weekCount,
  assignmentCount,
  premium,
  heroImageUrl,
  estimatedDuration,
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
        <CardTitle className="text-2xl text-foreground flex items-start justify-between gap-2">
          {title}
          {premium ? (
            <Badge variant="premium">Premium</Badge>
          ) : (
            <Badge variant="secondary">Free</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-2">
          {difficulty && (
            <Badge
              variant={
                difficultyVariantMap[
                  difficulty as keyof typeof difficultyVariantMap
                ]
              }
              size="lg"
            >
              {difficulty.toLowerCase()}
            </Badge>
          )}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3 text-xs text-foreground">
              <div>{weekCount} weeks</div>
              {estimatedDuration && <div>~{estimatedDuration} min/session</div>}
            </div>
            {formatUserCount(assignmentCount) && (
              <div className="flex items-center gap-2 text-xs text-foreground">
                <span>{formatUserCount(assignmentCount)} started</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
