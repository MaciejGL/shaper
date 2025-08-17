'use client'

import {
  AlertCircle,
  Bot,
  Dumbbell,
  Loader2,
  RefreshCw,
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

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
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
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
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
            <Button onClick={fetchStats} size="sm" variant="ghost">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
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
        deleteEndpoint="/api/admin/exercises/update"
        onStatsUpdate={fetchStats}
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
