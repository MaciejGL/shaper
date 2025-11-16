'use client'

import {
  AlertCircle,
  ArrowRight,
  Bot,
  Check,
  Dumbbell,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { ExerciseEditor } from '@/components/exercises/exercise-editor'
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
import { Separator } from '@/components/ui/separator'

interface ExerciseStats {
  totalExercises: number
  v1Exercises: number
  v2Exercises: number
  publicExercises: number
  privateExercises: number
  exercisesByDifficulty: {
    beginner: number
    intermediate: number
    advanced: number
    unclassified: number
  }
  exercisesByEquipment: Record<string, number>
  exercisesByDataSource: Record<string, number>
  lastImportDate: string | null
  hasExercemusData: boolean
}

interface DescriptionStats {
  totalPublicExercises: number
  exercisesWithoutDescription: number
  exercisesWithoutInstructions: number
  exercisesWithoutTips: number
  exercisesNeedingAnyContent: number
  percentageComplete: number
}

interface DescriptionGenerationState {
  isRunning: boolean
  isDryRun: boolean
  progress: string | null
  error: string | null
}

interface BaseIdRewriteState {
  isProcessing: boolean
  isPreviewing: boolean
  progress: string | null
  error: string | null
  previewData: {
    exercisesToUpdate: {
      id: string
      name: string
      currentBaseId: string
      weekNumber: number
      dayOfWeek: number
      userEmail: string
    }[]
  } | null
  lastResult: {
    updated: number
  } | null
}

interface ExerciseUsageSearchState {
  isSearching: boolean
  error: string | null
  results: {
    baseExercise: {
      id: string
      name: string
    }
    totalPlans: number
    totalExerciseInstances: number
    plans: {
      planId: string
      planTitle: string
      planActive: boolean
      planIsTemplate: boolean
      planIsDraft: boolean
      planCompletedAt: string | null
      userId: string
      userEmail: string
      userName: string | null
      createdById: string
      createdByEmail: string
      createdByName: string | null
      exerciseCount: number
      exercises: {
        exerciseId: string
        exerciseName: string
        weekNumber: number
        dayOfWeek: number
      }[]
    }[]
  } | null
}

export function ExercisesTab() {
  const [stats, setStats] = useState<ExerciseStats | null>(null)
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [descriptionStats, setDescriptionStats] =
    useState<DescriptionStats | null>(null)
  const [descriptionGeneration, setDescriptionGeneration] =
    useState<DescriptionGenerationState>({
      isRunning: false,
      isDryRun: false,
      progress: null,
      error: null,
    })

  const [baseIdRewrite, setBaseIdRewrite] = useState<BaseIdRewriteState>({
    isProcessing: false,
    isPreviewing: false,
    progress: null,
    error: null,
    previewData: null,
    lastResult: null,
  })
  const [oldBaseId, setOldBaseId] = useState('')
  const [exerciseNameFilter, setExerciseNameFilter] = useState('')
  const [newBaseId, setNewBaseId] = useState('')

  const [usageSearch, setUsageSearch] = useState<ExerciseUsageSearchState>({
    isSearching: false,
    error: null,
    results: null,
  })
  const [searchBaseId, setSearchBaseId] = useState('')

  const fetchStats = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
        setError(null)
      }
      const [statsResponse, descriptionResponse] = await Promise.all([
        fetch('/api/admin/exercises/stats'),
        fetch('/api/admin/exercises/generate-descriptions'),
      ])

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch exercise statistics')
      }
      if (!descriptionResponse.ok) {
        throw new Error('Failed to fetch description statistics')
      }

      const statsData = await statsResponse.json()
      const descriptionData = await descriptionResponse.json()

      setStats(statsData)
      setDescriptionStats(descriptionData)
    } catch (err) {
      if (showLoading) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } else {
        console.warn('Background stats update failed:', err)
      }
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const previewBaseIdRewrite = async () => {
    if (!oldBaseId.trim() || !newBaseId.trim()) {
      setBaseIdRewrite((prev) => ({
        ...prev,
        error: 'Both old and new baseId are required',
      }))
      return
    }

    try {
      setBaseIdRewrite({
        isProcessing: false,
        isPreviewing: true,
        progress: 'Loading preview...',
        error: null,
        previewData: null,
        lastResult: null,
      })

      const response = await fetch('/api/admin/exercises/rewrite-base-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldBaseId: oldBaseId.trim(),
          newBaseId: newBaseId.trim(),
          exerciseName: exerciseNameFilter.trim() || undefined,
          preview: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to preview: ${response.statusText}`)
      }

      const result = await response.json()

      setBaseIdRewrite({
        isProcessing: false,
        isPreviewing: false,
        progress: null,
        error: null,
        previewData: result,
        lastResult: null,
      })
    } catch (err) {
      setBaseIdRewrite({
        isProcessing: false,
        isPreviewing: false,
        progress: null,
        error: err instanceof Error ? err.message : 'Preview failed',
        previewData: null,
        lastResult: null,
      })
    }
  }

  const applyBaseIdRewrite = async () => {
    if (!oldBaseId.trim() || !newBaseId.trim()) {
      setBaseIdRewrite((prev) => ({
        ...prev,
        error: 'Both old and new baseId are required',
      }))
      return
    }

    try {
      setBaseIdRewrite((prev) => ({
        ...prev,
        isProcessing: true,
        progress: 'Updating exercises...',
        error: null,
        lastResult: null,
      }))

      const response = await fetch('/api/admin/exercises/rewrite-base-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldBaseId: oldBaseId.trim(),
          newBaseId: newBaseId.trim(),
          exerciseName: exerciseNameFilter.trim() || undefined,
          preview: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.statusText}`)
      }

      const result = await response.json()

      setBaseIdRewrite({
        isProcessing: false,
        isPreviewing: false,
        progress: `Successfully updated ${result.updated} exercises`,
        error: null,
        previewData: null,
        lastResult: result,
      })

      // Clear form on success
      setOldBaseId('')
      setExerciseNameFilter('')
      setNewBaseId('')
    } catch (err) {
      setBaseIdRewrite((prev) => ({
        ...prev,
        isProcessing: false,
        progress: null,
        error: err instanceof Error ? err.message : 'Update failed',
        lastResult: null,
      }))
    }
  }

  const generateDescriptions = async (dryRun: boolean = false) => {
    try {
      setDescriptionGeneration({
        isRunning: true,
        isDryRun: dryRun,
        progress: 'Starting AI description generation...',
        error: null,
      })

      const response = await fetch(
        '/api/admin/exercises/generate-descriptions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dryRun,
            batchSize: 10,
            skipExisting: true,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(
          `Failed to generate descriptions: ${response.statusText}`,
        )
      }

      const result = await response.json()

      setDescriptionGeneration({
        isRunning: false,
        isDryRun: dryRun,
        progress: result.message,
        error: null,
      })

      // Refresh stats after generation
      if (!dryRun) {
        await fetchStats()
      }
    } catch (err) {
      setDescriptionGeneration({
        isRunning: false,
        isDryRun: dryRun,
        progress: null,
        error: err instanceof Error ? err.message : 'Generation failed',
      })
    }
  }

  const uploadExercisesToAI = async () => {
    const response = await fetch('/api/ai/upload-exercises', {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to upload exercises')
    }
    await fetchStats()
  }

  const searchExerciseUsage = async () => {
    if (!searchBaseId.trim()) {
      setUsageSearch({
        isSearching: false,
        error: 'Base exercise ID is required',
        results: null,
      })
      return
    }

    try {
      setUsageSearch({
        isSearching: true,
        error: null,
        results: null,
      })

      const response = await fetch(
        `/api/admin/exercises/find-usage?baseId=${encodeURIComponent(searchBaseId.trim())}`,
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to search exercise usage')
      }

      const results = await response.json()

      setUsageSearch({
        isSearching: false,
        error: null,
        results,
      })
    } catch (err) {
      setUsageSearch({
        isSearching: false,
        error: err instanceof Error ? err.message : 'Search failed',
        results: null,
      })
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatNumber = (num: number) => num.toLocaleString()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading exercise statistics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Exercise Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Exercise Database Overview
          </CardTitle>
          <CardDescription>
            Comprehensive statistics about your exercise database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-card-on-card">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(stats.totalExercises)}
                </div>
                <p className="text-sm text-muted-foreground">Total Exercises</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-card-on-card">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(stats.v2Exercises)}
                </div>
                <p className="text-sm text-muted-foreground">V2 (Imported)</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-card-on-card">
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(stats.v1Exercises)}
                </div>
                <p className="text-sm text-muted-foreground">V1 (Manual)</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-card-on-card">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(stats.publicExercises)}
                </div>
                <p className="text-sm text-muted-foreground">Public</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {stats?.lastImportDate ? (
                <span>
                  Last import: {new Date(stats.lastImportDate).toLocaleString()}
                </span>
              ) : (
                <span>No imports yet</span>
              )}
            </div>
            <Button onClick={() => fetchStats()} size="sm" variant="ghost">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* BaseId Rewrite Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            BaseId Rewrite Tool
          </CardTitle>
          <CardDescription>
            Update baseId for training exercises (useful when trainer creates
            duplicate base exercises)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="old-base-id">Old BaseId</Label>
                <Input
                  id="old-base-id"
                  value={oldBaseId}
                  onChange={(e) => setOldBaseId(e.target.value)}
                  placeholder="cmb9sh4g9001ruhqrdiqya25y"
                  disabled={baseIdRewrite.isProcessing}
                />
                <p className="text-xs text-muted-foreground">
                  Current baseId to replace
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exercise-name-filter">
                  Exercise Name (Optional)
                </Label>
                <Input
                  id="exercise-name-filter"
                  value={exerciseNameFilter}
                  onChange={(e) => setExerciseNameFilter(e.target.value)}
                  placeholder="Tricep Pushdown"
                  disabled={baseIdRewrite.isProcessing}
                />
                <p className="text-xs text-muted-foreground">
                  Filter by exact exercise name
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-base-id">New BaseId</Label>
                <Input
                  id="new-base-id"
                  value={newBaseId}
                  onChange={(e) => setNewBaseId(e.target.value)}
                  placeholder="10bdb05f-d196-4bf7-8968-6df085bffb30"
                  disabled={baseIdRewrite.isProcessing}
                />
                <p className="text-xs text-muted-foreground">
                  Target baseId to set
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={previewBaseIdRewrite}
                variant="outline"
                disabled={
                  baseIdRewrite.isPreviewing ||
                  baseIdRewrite.isProcessing ||
                  !oldBaseId.trim() ||
                  !newBaseId.trim()
                }
                loading={baseIdRewrite.isPreviewing}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {baseIdRewrite.isPreviewing ? 'Loading...' : 'Preview Changes'}
              </Button>

              <Button
                onClick={applyBaseIdRewrite}
                disabled={
                  baseIdRewrite.isPreviewing ||
                  baseIdRewrite.isProcessing ||
                  !oldBaseId.trim() ||
                  !newBaseId.trim() ||
                  !baseIdRewrite.previewData
                }
                loading={baseIdRewrite.isProcessing}
              >
                <Check className="h-4 w-4 mr-2" />
                {baseIdRewrite.isProcessing ? 'Applying...' : 'Apply Changes'}
              </Button>
            </div>

            {/* Preview Data */}
            {baseIdRewrite.previewData && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">
                    Preview:{' '}
                    {baseIdRewrite.previewData.exercisesToUpdate.length}{' '}
                    exercises will be updated
                  </h5>
                  <div className="rounded-lg border bg-white max-h-60 overflow-y-auto">
                    {baseIdRewrite.previewData.exercisesToUpdate.map(
                      (exercise) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-3 border-b last:border-b-0 text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                              {exercise.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {exercise.userEmail} • Week {exercise.weekNumber}{' '}
                              Day {exercise.dayOfWeek}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <code className="px-2 py-1 bg-red-50 text-red-700 rounded">
                              {exercise.currentBaseId.slice(0, 8)}...
                            </code>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <code className="px-2 py-1 bg-green-50 text-green-700 rounded">
                              {newBaseId.slice(0, 8)}...
                            </code>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Progress */}
            {baseIdRewrite.progress && (
              <Alert
                className={`${baseIdRewrite.error ? 'border-red-200' : 'border-blue-200'}`}
              >
                <RefreshCw className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center gap-2">
                    {(baseIdRewrite.isProcessing ||
                      baseIdRewrite.isPreviewing) && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <span>{baseIdRewrite.progress}</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error */}
            {baseIdRewrite.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{baseIdRewrite.error}</AlertDescription>
              </Alert>
            )}

            {/* Last Result */}
            {baseIdRewrite.lastResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {baseIdRewrite.lastResult.updated}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Exercises Updated
                  </p>
                </div>
              </div>
            )}

            {/* Information Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>How it works:</strong> This tool finds all training
                exercises with the specified old baseId and updates them to use
                the new baseId. Use the optional exercise name filter to only
                update exercises with exact name matches. Always preview changes
                before applying!
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Base Usage Finder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Exercise Base Usage Finder
          </CardTitle>
          <CardDescription>
            Search by exercise base ID to find which plans use this exercise and
            by whom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search Input */}
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search-base-id">Base Exercise ID</Label>
                <Input
                  id="search-base-id"
                  value={searchBaseId}
                  onChange={(e) => setSearchBaseId(e.target.value)}
                  placeholder="e.g., cmb9sh4g9001ruhqrdiqya25y"
                  disabled={usageSearch.isSearching}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchExerciseUsage()
                    }
                  }}
                />
              </div>
              <Button
                onClick={searchExerciseUsage}
                disabled={usageSearch.isSearching || !searchBaseId.trim()}
                loading={usageSearch.isSearching}
                className="mt-7"
              >
                <Search className="h-4 w-4 mr-2" />
                {usageSearch.isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Error */}
            {usageSearch.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{usageSearch.error}</AlertDescription>
              </Alert>
            )}

            {/* Results */}
            {usageSearch.results && (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card-on-card rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {usageSearch.results.baseExercise.name}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Base Exercise
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(usageSearch.results.totalPlans)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Plans</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatNumber(usageSearch.results.totalExerciseInstances)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Exercise Instances
                    </p>
                  </div>
                </div>

                {/* Plans List */}
                {usageSearch.results.totalPlans > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">
                      Plans Using This Exercise
                    </h4>
                    <div className="rounded-lg border">
                      <div className="max-h-96 overflow-y-auto">
                        {usageSearch.results.plans.map((plan) => (
                          <div
                            key={plan.planId}
                            className="p-4 border-b last:border-b-0"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium">
                                    {plan.planTitle}
                                  </h5>
                                  <div className="flex items-center gap-1">
                                    {plan.planActive && (
                                      <Badge variant="premium">Active</Badge>
                                    )}
                                    {plan.planIsTemplate && (
                                      <Badge variant="outline">Template</Badge>
                                    )}
                                    {plan.planIsDraft && (
                                      <Badge variant="outline">Draft</Badge>
                                    )}
                                    {plan.planCompletedAt && (
                                      <Badge variant="outline">Completed</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>
                                    <strong>Assigned to:</strong>{' '}
                                    {plan.userName || 'N/A'} ({plan.userEmail})
                                  </p>
                                  <p>
                                    <strong>Created by:</strong>{' '}
                                    {plan.createdByName || 'N/A'} (
                                    {plan.createdByEmail})
                                  </p>
                                  <p>
                                    <strong>Exercise count:</strong>{' '}
                                    {plan.exerciseCount} instance
                                    {plan.exerciseCount !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Exercise instances in this plan */}
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-medium mb-2">
                                Appears in:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {plan.exercises.map((exercise) => (
                                  <Badge
                                    key={exercise.exerciseId}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    Week {exercise.weekNumber}, Day{' '}
                                    {exercise.dayOfWeek}
                                    {exercise.exerciseName !==
                                      usageSearch.results!.baseExercise.name &&
                                      ` - ${exercise.exerciseName}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No plans found using this base exercise.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Information Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>How to use:</strong> Enter the base exercise ID to see
                all training plans that include this exercise. Results show plan
                details, assigned users, and specific locations (week/day) where
                the exercise appears.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Exercises</CardTitle>
          <CardDescription>Upload exercises to AI assistants</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={uploadExercisesToAI}>Upload Exercises to AI</Button>
        </CardContent>
      </Card>

      {/* AI Exercise Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Exercise Descriptions
          </CardTitle>
          <CardDescription>
            Generate informative descriptions, step-by-step instructions, and
            helpful tips for public exercises using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Description Statistics */}
          {descriptionStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-card-on-card">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(descriptionStats.totalPublicExercises)}
                </div>
                <p className="text-sm text-muted-foreground">Total Public</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-card-on-card">
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(descriptionStats.exercisesWithoutDescription)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Missing Description
                </p>
              </div>

              <div className="text-center p-4 rounded-lg bg-card-on-card">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatNumber(descriptionStats.exercisesWithoutInstructions)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Missing Instructions
                </p>
              </div>

              <div className="text-center p-4 rounded-lg bg-card-on-card">
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(descriptionStats.exercisesWithoutTips)}
                </div>
                <p className="text-sm text-muted-foreground">Missing Tips</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-card-on-card">
                <div className="text-2xl font-bold text-green-600">
                  {descriptionStats.percentageComplete}%
                </div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          )}

          {/* Generation Progress */}
          {descriptionGeneration.progress && (
            <Alert
              className={`mb-6 ${descriptionGeneration.error ? 'border-red-200' : 'border-blue-200'}`}
            >
              <Bot className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-2">
                  {descriptionGeneration.isRunning && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span>{descriptionGeneration.progress}</span>
                  {descriptionGeneration.isDryRun && (
                    <Badge variant="outline" className="ml-2">
                      DRY RUN
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Generation Error */}
          {descriptionGeneration.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{descriptionGeneration.error}</AlertDescription>
            </Alert>
          )}

          {/* Generation Actions */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Dry Run */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h5 className="font-medium text-blue-600">
                    Preview Generation
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    Test AI generation without saving changes
                  </p>
                </div>
                <Button
                  onClick={() => generateDescriptions(true)}
                  variant="outline"
                  disabled={descriptionGeneration.isRunning}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {descriptionGeneration.isRunning &&
                  descriptionGeneration.isDryRun
                    ? 'Running...'
                    : 'Preview'}
                </Button>
              </div>

              {/* Full Generation */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h5 className="font-medium text-green-600">
                    Generate Descriptions
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    Generate and save AI descriptions for all public exercises
                  </p>
                </div>
                <Button
                  onClick={() => generateDescriptions(false)}
                  disabled={descriptionGeneration.isRunning}
                  loading={
                    descriptionGeneration.isRunning &&
                    !descriptionGeneration.isDryRun
                  }
                >
                  <Bot className="h-4 w-4 mr-2" />
                  {descriptionGeneration.isRunning &&
                  !descriptionGeneration.isDryRun
                    ? 'Generating...'
                    : 'Generate All'}
                </Button>
              </div>
            </div>

            {/* Information Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>How it works:</strong> AI will generate descriptions,
                step-by-step instructions, and helpful tips for public exercises
                that are missing content. Uses GPT-4 with context about muscle
                groups and equipment. Skips exercises that already have complete
                content.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Exercise Editor */}
      <ExerciseEditor
        apiEndpoint="/api/admin/exercises/list"
        updateEndpoint="/api/admin/exercises/update"
        deleteEndpoint="/api/admin/exercises"
        onStatsUpdate={() => fetchStats(false)}
      />

      {/* Difficulty & Equipment Breakdown */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Difficulty Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.exercisesByDifficulty).map(
                  ([difficulty, count]) => (
                    <div
                      key={difficulty}
                      className="flex items-center justify-between"
                    >
                      <span className="capitalize">{difficulty}</span>
                      <Badge variant="outline">{formatNumber(count)}</Badge>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
