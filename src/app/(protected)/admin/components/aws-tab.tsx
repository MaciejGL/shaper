'use client'

import {
  AlertCircle,
  Database,
  HardDrive,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'

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

interface StorageStats {
  storage: {
    exercises: FolderStats
    tempFolder: FolderStats
    avatars: FolderStats
    progressPhotos: FolderStats
    total: {
      fileCount: number
      totalSizeBytes: number
    }
  }
  database: {
    exerciseImagesInDb: number
    totalExercises: number
    orphanedExerciseImages: number
  }
  tempFolderAnalysis: {
    totalTempFiles: number
    filesOlderThan24h: number
    filesOlderThanWeek: number
    bytesOlderThan24h: number
    bytesOlderThanWeek: number
    totalTempBytes: number
    recommendations: {
      canCleanup24h: number
      canCleanupWeek: number
      potentialSavings24h: string
      potentialSavingsWeek: string
    }
  }
}

interface FolderStats {
  fileCount: number
  totalSizeBytes: number
  oldestFile?: {
    key: string
    lastModified: string
    sizeBytes: number
  }
  newestFile?: {
    key: string
    lastModified: string
    sizeBytes: number
  }
}

interface CleanupResult {
  success: boolean
  dryRun?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats?: any
  cleaned?: number
  message?: string
  error?: string
}

export function AwsTab() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [lastCleanup, setLastCleanup] = useState<CleanupResult | null>(null)
  const [maxAge, setMaxAge] = useState(24)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/storage-stats')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch storage stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch storage stats',
      )
    } finally {
      setLoading(false)
    }
  }

  const performCleanup = async (dryRun: boolean = false) => {
    try {
      setCleanupLoading(true)
      setError(null)

      const response = await fetch('/api/admin/cleanup-temp-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dryRun,
          maxAge,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to perform cleanup')
      }

      const result = await response.json()
      setLastCleanup(result)

      // Refresh stats after cleanup
      if (!dryRun) {
        await fetchStats()
      }
    } catch (error) {
      console.error('Error performing cleanup:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to perform cleanup',
      )
    } finally {
      setCleanupLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading AWS storage data...</span>
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

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.storage.total.fileCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(stats?.storage.total.totalSizeBytes || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Temp Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.storage.tempFolder.fileCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(stats?.storage.tempFolder.totalSizeBytes || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Exercise Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.database.exerciseImagesInDb || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.database.totalExercises || 0} exercises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Orphaned Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.database.orphanedExerciseImages || 0}
            </div>
            <p className="text-xs text-muted-foreground">Need cleanup</p>
          </CardContent>
        </Card>
      </div>

      {/* Temp Folder Cleanup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Temp Folder Cleanup
          </CardTitle>
          <CardDescription>
            Clean up orphaned images in the temp folder that are older than the
            specified age
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-card-on-card">
            <div>
              <p className="text-sm font-medium">Files &gt; 24h</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats?.tempFolderAnalysis.filesOlderThan24h || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.tempFolderAnalysis.recommendations.potentialSavings24h}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Files &gt; 1 week</p>
              <p className="text-2xl font-bold text-red-600">
                {stats?.tempFolderAnalysis.filesOlderThanWeek || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.tempFolderAnalysis.recommendations.potentialSavingsWeek}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Temp</p>
              <p className="text-2xl font-bold">
                {stats?.tempFolderAnalysis.totalTempFiles || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(stats?.tempFolderAnalysis.totalTempBytes || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Cleanup Target</p>
              <p className="text-2xl font-bold text-blue-600">{maxAge}h</p>
              <p className="text-xs text-muted-foreground">Max age setting</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="maxAge">Max Age (hours):</Label>
              <Input
                id="maxAge"
                type="number"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                min="1"
                max="168"
                className="w-20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => performCleanup(true)}
              disabled={cleanupLoading}
              variant="outline"
            >
              {cleanupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Preview Cleanup
            </Button>
            <Button
              onClick={() => performCleanup(false)}
              disabled={cleanupLoading}
              variant="destructive"
            >
              {cleanupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Execute Cleanup
            </Button>
            <Button onClick={fetchStats} disabled={loading} variant="ghost">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
          </div>

          {lastCleanup && (
            <Alert variant={lastCleanup.success ? 'default' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span
                    className={
                      lastCleanup.success
                        ? 'text-green-800'
                        : 'text-destructive'
                    }
                  >
                    {lastCleanup.message || lastCleanup.error}
                  </span>
                  {lastCleanup.dryRun && (
                    <Badge variant="outline">Preview Mode</Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Storage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Exercise Images', data: stats?.storage.exercises },
              { name: 'Temp Folder', data: stats?.storage.tempFolder },
              { name: 'Avatars', data: stats?.storage.avatars },
              { name: 'Progress Photos', data: stats?.storage.progressPhotos },
            ].map(({ name, data }) => (
              <div
                key={name}
                className="flex items-center justify-between p-3 rounded-lg bg-card-on-card"
              >
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">
                    {data?.fileCount || 0} files
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {formatBytes(data?.totalSizeBytes || 0)}
                  </p>
                  {data?.oldestFile && (
                    <p className="text-xs text-muted-foreground">
                      Oldest: {formatDate(data.oldestFile.lastModified)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
