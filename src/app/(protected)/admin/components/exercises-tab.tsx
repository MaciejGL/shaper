'use client'

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  Dumbbell,
  Link,
  Loader2,
  RefreshCw,
  Sparkles,
  Wrench,
  X,
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

interface BrokenExercise {
  id: string
  name: string
  createdAt: string
  baseId: string | null
}

interface BrokenExerciseStats {
  totalBroken: number
  exercises: BrokenExercise[]
}

interface FixRelationshipsState {
  isRunning: boolean
  progress: string | null
  error: string | null
  lastResult: {
    totalBroken: number
    fixed: number
    notFound: number
  } | null
}

type SingleFixState = Record<
  string,
  {
    isFixing: boolean
    isFixed: boolean
    error: string | null
    result: string | null
  }
>

interface ManualMappingState {
  isMapping: boolean
  progress: string | null
  error: string | null
  lastResult: {
    matched: number
    updated: number
  } | null
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

  const [brokenExercises, setBrokenExercises] =
    useState<BrokenExerciseStats | null>(null)
  const [fixRelationships, setFixRelationships] =
    useState<FixRelationshipsState>({
      isRunning: false,
      progress: null,
      error: null,
      lastResult: null,
    })

  const [singleFixes, setSingleFixes] = useState<SingleFixState>({})

  const [manualMapping, setManualMapping] = useState<ManualMappingState>({
    isMapping: false,
    progress: null,
    error: null,
    lastResult: null,
  })

  const [brokenExerciseName, setBrokenExerciseName] = useState('')
  const [correctBaseExerciseName, setCorrectBaseExerciseName] = useState('')

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

  const fetchStats = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
        setError(null)
      }
      const [statsResponse, descriptionResponse, brokenExercisesResponse] =
        await Promise.all([
          fetch('/api/admin/exercises/stats'),
          fetch('/api/admin/exercises/generate-descriptions'),
          fetch('/api/admin/exercises/broken-relationships'),
        ])

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch exercise statistics')
      }
      if (!descriptionResponse.ok) {
        throw new Error('Failed to fetch description statistics')
      }
      if (!brokenExercisesResponse.ok) {
        throw new Error('Failed to fetch broken exercise data')
      }

      const statsData = await statsResponse.json()
      const descriptionData = await descriptionResponse.json()
      const brokenExercisesData = await brokenExercisesResponse.json()

      setStats(statsData)
      setDescriptionStats(descriptionData)
      setBrokenExercises(brokenExercisesData)

      // Clear single fix states when refreshing data
      setSingleFixes({})
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

  const fixBrokenRelationships = async () => {
    try {
      setFixRelationships({
        isRunning: true,
        progress: 'Analyzing broken exercise relationships...',
        error: null,
        lastResult: null,
      })

      const response = await fetch('/api/admin/exercises/fix-relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Failed to fix relationships: ${response.statusText}`)
      }

      const result = await response.json()

      setFixRelationships({
        isRunning: false,
        progress: `Fixed ${result.fixed} exercises, ${result.notFound} still need attention`,
        error: null,
        lastResult: result,
      })

      // Clear single fix states since they'll be outdated
      setSingleFixes({})

      // Refresh stats after fixing
      await fetchStats()
    } catch (err) {
      setFixRelationships({
        isRunning: false,
        progress: null,
        error: err instanceof Error ? err.message : 'Fix operation failed',
        lastResult: null,
      })
    }
  }

  const fixSingleExercise = async (exerciseId: string) => {
    try {
      // Set loading state for this specific exercise
      setSingleFixes((prev) => ({
        ...prev,
        [exerciseId]: {
          isFixing: true,
          isFixed: false,
          error: null,
          result: null,
        },
      }))

      const response = await fetch('/api/admin/exercises/fix-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fix exercise: ${response.statusText}`)
      }

      const result = await response.json()

      // Set success state
      setSingleFixes((prev) => ({
        ...prev,
        [exerciseId]: {
          isFixing: false,
          isFixed: true,
          error: null,
          result: result.message,
        },
      }))

      // Refresh stats after fixing
      await fetchStats()
    } catch (err) {
      // Set error state
      setSingleFixes((prev) => ({
        ...prev,
        [exerciseId]: {
          isFixing: false,
          isFixed: false,
          error: err instanceof Error ? err.message : 'Fix failed',
          result: null,
        },
      }))
    }
  }

  const mapExerciseManually = async () => {
    if (!brokenExerciseName.trim() || !correctBaseExerciseName.trim()) {
      setManualMapping((prev: ManualMappingState) => ({
        ...prev,
        error: 'Both exercise names are required',
      }))
      return
    }

    try {
      setManualMapping({
        isMapping: true,
        progress: `Mapping "${brokenExerciseName}" to "${correctBaseExerciseName}"...`,
        error: null,
        lastResult: null,
      })

      const response = await fetch('/api/admin/exercises/manual-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brokenExerciseName: brokenExerciseName.trim(),
          correctBaseExerciseName: correctBaseExerciseName.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to map exercises: ${response.statusText}`)
      }

      const result = await response.json()

      setManualMapping({
        isMapping: false,
        progress: `Successfully mapped ${result.updated} exercises`,
        error: null,
        lastResult: result,
      })

      // Clear form on success
      setBrokenExerciseName('')
      setCorrectBaseExerciseName('')

      // Refresh stats after mapping
      await fetchStats()
    } catch (err) {
      setManualMapping({
        isMapping: false,
        progress: null,
        error: err instanceof Error ? err.message : 'Mapping failed',
        lastResult: null,
      })
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

      {/* Broken Exercise Relationships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Exercise Relationship Issues
            {brokenExercises && brokenExercises.totalBroken > 0 && (
              <Badge variant="destructive" className="ml-2">
                {brokenExercises.totalBroken} Issues
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage training exercises with missing or broken base exercise
            relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          {brokenExercises && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-card-on-card">
                  <div
                    className={`text-2xl font-bold ${brokenExercises.totalBroken > 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {formatNumber(brokenExercises.totalBroken)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Broken Relationships
                  </p>
                </div>

                {fixRelationships.lastResult && (
                  <>
                    <div className="text-center p-4 rounded-lg bg-card-on-card">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(fixRelationships.lastResult.fixed)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last Fixed
                      </p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-card-on-card">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatNumber(fixRelationships.lastResult.notFound)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Need Manual Fix
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Fix Progress */}
              {fixRelationships.progress && (
                <Alert
                  className={`mb-6 ${fixRelationships.error ? 'border-red-200' : 'border-blue-200'}`}
                >
                  <Wrench className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center gap-2">
                      {fixRelationships.isRunning && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <span>{fixRelationships.progress}</span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Fix Error */}
              {fixRelationships.error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{fixRelationships.error}</AlertDescription>
                </Alert>
              )}

              {/* Broken Exercises List */}
              {brokenExercises.totalBroken > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Exercises with Issues ({
                      brokenExercises.exercises.length
                    }{' '}
                    shown)
                  </h4>
                  <div className="rounded-lg border">
                    <div className="max-h-60 overflow-y-auto">
                      {brokenExercises.exercises.map((exercise) => {
                        const fixState = singleFixes[exercise.id]
                        const isFixed = fixState?.isFixed
                        const isFixing = fixState?.isFixing
                        const fixError = fixState?.error
                        const fixResult = fixState?.result

                        return (
                          <div
                            key={exercise.id}
                            className="flex items-center justify-between p-3 border-b last:border-b-0 gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {exercise.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Created:{' '}
                                {new Date(
                                  exercise.createdAt,
                                ).toLocaleDateString()}
                              </p>
                              {fixResult && (
                                <p className="text-xs text-green-600 mt-1">
                                  {fixResult}
                                </p>
                              )}
                              {fixError && (
                                <p className="text-xs text-red-600 mt-1">
                                  {fixError}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {isFixed ? (
                                <Badge
                                  variant="outline"
                                  className="text-green-600 border-green-200"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Fixed
                                </Badge>
                              ) : fixError ? (
                                <Badge
                                  variant="outline"
                                  className="text-red-600 border-red-200"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Error
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-red-600 border-red-200"
                                >
                                  No Base Exercise
                                </Badge>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fixSingleExercise(exercise.id)}
                                disabled={isFixed || isFixing}
                                loading={isFixing}
                                className="min-w-[60px]"
                              >
                                {isFixed ? (
                                  <Check className="h-3 w-3" />
                                ) : isFixing ? (
                                  'Fixing...'
                                ) : (
                                  'Fix'
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Fix Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium text-blue-600">
                      Auto-Fix Relationships
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Automatically match training exercises to existing base
                      exercises by name
                    </p>
                  </div>
                  <Button
                    onClick={fixBrokenRelationships}
                    disabled={
                      fixRelationships.isRunning ||
                      brokenExercises.totalBroken === 0
                    }
                    loading={fixRelationships.isRunning}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    {fixRelationships.isRunning
                      ? 'Fixing...'
                      : 'Fix Relationships'}
                  </Button>
                </div>

                {/* Information Alert */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>How it works:</strong> The system will attempt to
                    match training exercises to existing base exercises by name.
                    For exercises without matches, new base exercises will be
                    created with default muscle group assignments. You can
                    manually adjust muscle groups in the Exercise Editor below.
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Manual Exercise Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Manual Exercise Mapping
          </CardTitle>
          <CardDescription>
            Manually link training exercises to correct base exercises by name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Mapping Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="broken-exercise">Broken Exercise Name</Label>
                <Input
                  id="broken-exercise"
                  value={brokenExerciseName}
                  onChange={(e) => setBrokenExerciseName(e.target.value)}
                  placeholder="e.g., Chest Press Machine"
                  disabled={manualMapping.isMapping}
                />
                <p className="text-xs text-muted-foreground">
                  Exercise name that has missing baseId relationships
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correct-exercise">
                  Correct Base Exercise Name
                </Label>
                <Input
                  id="correct-exercise"
                  value={correctBaseExerciseName}
                  onChange={(e) => setCorrectBaseExerciseName(e.target.value)}
                  placeholder="e.g., Chest Press"
                  disabled={manualMapping.isMapping}
                />
                <p className="text-xs text-muted-foreground">
                  Existing base exercise name to link to
                </p>
              </div>
            </div>

            {/* Map Button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={mapExerciseManually}
                disabled={
                  manualMapping.isMapping ||
                  !brokenExerciseName.trim() ||
                  !correctBaseExerciseName.trim()
                }
                loading={manualMapping.isMapping}
                className="min-w-[120px]"
              >
                <Link className="h-4 w-4 mr-2" />
                {manualMapping.isMapping ? 'Mapping...' : 'Map Exercises'}
              </Button>

              {brokenExerciseName && correctBaseExerciseName && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="font-medium">{brokenExerciseName}</span>
                  <ArrowRight className="h-3 w-3 mx-2" />
                  <span className="font-medium">{correctBaseExerciseName}</span>
                </div>
              )}
            </div>

            {/* Mapping Progress */}
            {manualMapping.progress && (
              <Alert
                className={`${manualMapping.error ? 'border-red-200' : 'border-blue-200'}`}
              >
                <Link className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center gap-2">
                    {manualMapping.isMapping && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <span>{manualMapping.progress}</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Mapping Error */}
            {manualMapping.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{manualMapping.error}</AlertDescription>
              </Alert>
            )}

            {/* Last Result */}
            {manualMapping.lastResult && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {manualMapping.lastResult.matched}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Base Exercise Found
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {manualMapping.lastResult.updated}
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
                <strong>How it works:</strong> Enter the exact name of broken
                training exercises and the name of the base exercise they should
                link to. The system will find the base exercise and update all
                matching training exercises with null baseId relationships.
              </AlertDescription>
            </Alert>
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
