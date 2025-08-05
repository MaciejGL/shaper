'use client'

import {
  AlertCircle,
  Download,
  Dumbbell,
  Loader2,
  Play,
  RefreshCw,
  Zap,
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
import { Progress } from '@/components/ui/progress'
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

interface ImportProgress {
  isRunning: boolean
  type: 'test' | 'full' | null
  progress: number
  currentBatch: number
  totalBatches: number
  imported: number
  skipped: number
  failed: number
  currentExercise: string | null
  startTime: number | null
}

export function ExercisesTab() {
  const [stats, setStats] = useState<ExerciseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    isRunning: false,
    type: null,
    progress: 0,
    currentBatch: 0,
    totalBatches: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
    currentExercise: null,
    startTime: null,
  })
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/exercises/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch exercise statistics')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const downloadExercemusData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/exercises/download-exercemus')
      if (!response.ok) {
        throw new Error('Failed to download exercemus data')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'exercemus-exercises.json'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Refresh stats after download
      fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    }
  }

  const startImport = async (type: 'test' | 'full') => {
    try {
      setError(null)
      setImportProgress({
        isRunning: true,
        type,
        progress: 0,
        currentBatch: 0,
        totalBatches: 0,
        imported: 0,
        skipped: 0,
        failed: 0,
        currentExercise: null,
        startTime: Date.now(),
      })

      const response = await fetch(`/api/admin/exercises/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`)
      }

      // Use Server-Sent Events or polling to track progress
      const reader = response.body?.getReader()
      if (reader) {
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                setImportProgress((prev) => ({ ...prev, ...data }))
              } catch (e) {
                console.warn('Failed to parse progress data:', e)
              }
            }
          }
        }
      }

      // Refresh stats after import
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImportProgress((prev) => ({ ...prev, isRunning: false }))
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatNumber = (num: number) => num.toLocaleString()
  const getElapsedTime = () => {
    if (!importProgress.startTime) return ''
    const elapsed = Math.floor((Date.now() - importProgress.startTime) / 1000)
    return `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`
  }

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

      {/* Import Progress */}
      {importProgress.isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Import in Progress
              <Badge variant="outline">
                {importProgress.type?.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={importProgress.progress} className="w-full" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Batch:</span>{' '}
                  {importProgress.currentBatch}/{importProgress.totalBatches}
                </div>
                <div>
                  <span className="font-medium">Imported:</span>{' '}
                  <span className="text-green-600">
                    {importProgress.imported}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Skipped:</span>{' '}
                  <span className="text-yellow-600">
                    {importProgress.skipped}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Failed:</span>{' '}
                  <span className="text-red-600">{importProgress.failed}</span>
                </div>
              </div>

              {importProgress.currentExercise && (
                <div className="text-sm text-muted-foreground">
                  Currently processing:{' '}
                  <span className="font-mono">
                    {importProgress.currentExercise}
                  </span>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Elapsed time: {getElapsedTime()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Database Management</CardTitle>
          <CardDescription>
            Download exercemus data and perform exercise imports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Download Section */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Download Exercemus Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download the latest exercise data (872+ exercises) from
                  Exercemus
                </p>
              </div>
              <Button
                onClick={downloadExercemusData}
                variant="outline"
                disabled={importProgress.isRunning}
              >
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>

            <Separator />

            {/* Import Actions */}
            <div className="space-y-3">
              <h4 className="font-medium">Import Exercises</h4>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Test Import */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium text-green-600">Test Import</h5>
                    <p className="text-sm text-muted-foreground">
                      Import 10 exercises for testing
                    </p>
                  </div>
                  <Button
                    onClick={() => startImport('test')}
                    variant="outline"
                    disabled={importProgress.isRunning}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Test (10)
                  </Button>
                </div>

                {/* Full Import */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium text-blue-600">Full Import</h5>
                    <p className="text-sm text-muted-foreground">
                      Import all 872+ exercises
                    </p>
                  </div>
                  <Button
                    onClick={() => startImport('full')}
                    disabled={importProgress.isRunning}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Full Import
                  </Button>
                </div>
              </div>
            </div>

            {/* Safety Note */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Imports will skip exercises that already
                exist (duplicate detection). V2 exercises are marked with
                version=2 and dataSource="exercemus" for easy identification.
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

          {/* Data Source Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.exercisesByDataSource).map(
                  ([source, count]) => (
                    <div
                      key={source}
                      className="flex items-center justify-between"
                    >
                      <span>{source || 'Manual'}</span>
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
