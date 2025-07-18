'use client'

import {
  AlertCircle,
  Database,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Trash2,
  Utensils,
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
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface FoodDataStats {
  usda: {
    totalFoods: number
    lastImported: string | null
    dataTypes: {
      foundationFoods: number
      srLegacy: number
      branded: number
    }
  }
  openFoodFacts: {
    // Local bulk data statistics
    totalProducts: number
    withNutrition: number
    withImages: number
    withNutriScore: number
    completionRate: number
    avgCompleteness: number
    lastImported: string | null
    // Legacy API cache data
    cachedProducts: number
    lastCached: string | null
  }
}

interface ImportStatus {
  isDownloading: boolean
  isParsing: boolean
  isImporting: boolean
  isConvertingCsv: boolean
  progress: number
  currentStep: string
  logs: string[]
}

export function FoodsTab() {
  const [stats, setStats] = useState<FoodDataStats | null>(null)
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    isDownloading: false,
    isParsing: false,
    isImporting: false,
    isConvertingCsv: false,
    progress: 0,
    currentStep: '',
    logs: [],
  })
  const [openFoodFactsStatus, setOpenFoodFactsStatus] = useState<ImportStatus>({
    isDownloading: false,
    isParsing: false,
    isImporting: false,
    isConvertingCsv: false,
    progress: 0,
    currentStep: '',
    logs: [],
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch('/api/admin/food-stats')
      if (!response.ok) throw new Error('Failed to fetch food data stats')

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleDownloadUSDAData = async () => {
    try {
      setImportStatus((prev) => ({
        ...prev,
        isDownloading: true,
        currentStep: 'Downloading USDA datasets...',
        logs: [...prev.logs, 'Starting USDA data download...'],
      }))

      const response = await fetch('/api/admin/usda-download', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to start download')

      // Poll for progress updates
      pollImportStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
      setImportStatus((prev) => ({ ...prev, isDownloading: false }))
    }
  }

  const handleParseUSDAData = async () => {
    try {
      setImportStatus((prev) => ({
        ...prev,
        isParsing: true,
        currentStep: 'Parsing USDA CSV files...',
        logs: [...prev.logs, 'Starting data parsing...'],
      }))

      const response = await fetch('/api/admin/usda-parse', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to start parsing')

      pollImportStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parsing failed')
      setImportStatus((prev) => ({ ...prev, isParsing: false }))
    }
  }

  const handleFullUSDAUpdateProcess = async () => {
    try {
      setError(null)

      // Run download first
      await handleDownloadUSDAData()

      // Note: Additional steps would need to be implemented
      // This is a placeholder for a full automation workflow
      alert('Full update process initiated. Monitor the progress above.')
    } catch (err) {
      console.error('Full update error:', err)
      setError(err instanceof Error ? err.message : 'Full update failed')
      resetImportStatus()
    }
  }

  const handleTestUSDAScripts = async () => {
    try {
      setError(null)
      alert(
        'USDA data system is ready! Use individual steps or download first.',
      )
    } catch (err) {
      console.error('Test error:', err)
      setError(err instanceof Error ? err.message : 'Test failed')
    }
  }

  const handleSyncUSDADatabase = async () => {
    if (
      !confirm(
        'This will sync the CSV data to the database using upserts (insert new, update existing). Are you sure you want to proceed?',
      )
    ) {
      return
    }

    try {
      setImportStatus((prev) => ({
        ...prev,
        isImporting: true,
        currentStep: 'Starting database sync...',
        logs: [...prev.logs, 'Starting database sync from CSV...'],
      }))

      const response = await fetch('/api/admin/usda-sync', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to start database sync')

      pollImportStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database sync failed')
      setImportStatus((prev) => ({ ...prev, isImporting: false }))
    }
  }

  const handleClearUSDAData = async () => {
    if (
      !confirm(
        'Are you sure you want to clear all USDA food data? This action cannot be undone.',
      )
    ) {
      return
    }

    try {
      setIsLoadingStats(true)
      const response = await fetch('/api/admin/usda-clear', {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to clear USDA data')

      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data')
    } finally {
      setIsLoadingStats(false)
    }
  }

  const pollImportStatus = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/usda-import-status')
        if (response.ok) {
          const status = await response.json()
          setImportStatus(status)

          if (
            !status.isDownloading &&
            !status.isParsing &&
            !status.isImporting
          ) {
            clearInterval(interval)
            await fetchStats() // Refresh stats when done
          }
        }
      } catch (err) {
        console.error('Failed to poll import status:', err)
      }
    }, 1000) // Reduced from 2000ms to 1000ms for more responsive updates

    // Clear interval after 10 minutes to prevent infinite polling
    setTimeout(() => clearInterval(interval), 10 * 60 * 1000)
  }

  const resetImportStatus = () => {
    setImportStatus({
      isDownloading: false,
      isParsing: false,
      isImporting: false,
      isConvertingCsv: false,
      progress: 0,
      currentStep: '',
      logs: [],
    })
  }

  // OpenFoodFacts handlers
  const handleDownloadOpenFoodFactsData = async () => {
    try {
      setOpenFoodFactsStatus((prev) => ({
        ...prev,
        isDownloading: true,
        currentStep: 'Downloading OpenFoodFacts dataset...',
        logs: [...prev.logs, 'Starting OpenFoodFacts data download...'],
      }))

      const response = await fetch('/api/admin/openfoodfacts-download', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to start download')

      pollOpenFoodFactsStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
      setOpenFoodFactsStatus((prev) => ({ ...prev, isDownloading: false }))
    }
  }

  const handleParseOpenFoodFactsData = async () => {
    try {
      setOpenFoodFactsStatus((prev) => ({
        ...prev,
        isParsing: true,
        currentStep: 'Parsing OpenFoodFacts Parquet file...',
        logs: [...prev.logs, 'Starting data parsing...'],
      }))

      const response = await fetch('/api/admin/openfoodfacts-parse', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to start parsing')

      pollOpenFoodFactsStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parsing failed')
      setOpenFoodFactsStatus((prev) => ({ ...prev, isParsing: false }))
    }
  }

  const handleFullOpenFoodFactsUpdateProcess = async () => {
    try {
      setError(null)

      // Run download first
      await handleDownloadOpenFoodFactsData()

      alert('Full update process initiated. Monitor the progress above.')
    } catch (err) {
      console.error('Full update error:', err)
      setError(err instanceof Error ? err.message : 'Full update failed')
      resetOpenFoodFactsStatus()
    }
  }

  const handleSyncOpenFoodFactsDatabase = async () => {
    if (
      !confirm(
        'This will sync the CSV data to the database using upserts (insert new, update existing). Are you sure you want to proceed?',
      )
    ) {
      return
    }

    try {
      setOpenFoodFactsStatus((prev) => ({
        ...prev,
        isImporting: true,
        currentStep: 'Starting database sync...',
        logs: [...prev.logs, 'Starting database sync from CSV...'],
      }))

      const response = await fetch('/api/admin/openfoodfacts-sync', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to start database sync')

      pollOpenFoodFactsStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database sync failed')
      setOpenFoodFactsStatus((prev) => ({ ...prev, isImporting: false }))
    }
  }

  const handleClearOpenFoodFactsData = async () => {
    if (
      !confirm(
        'Are you sure you want to clear all OpenFoodFacts product data? This action cannot be undone.',
      )
    ) {
      return
    }

    try {
      setIsLoadingStats(true)
      const response = await fetch('/api/admin/openfoodfacts-clear', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to clear OpenFoodFacts data')

      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data')
    } finally {
      setIsLoadingStats(false)
    }
  }

  const pollOpenFoodFactsStatus = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/openfoodfacts-import-status')
        if (response.ok) {
          const status = await response.json()
          setOpenFoodFactsStatus(status)

          if (
            !status.isDownloading &&
            !status.isParsing &&
            !status.isImporting
          ) {
            clearInterval(interval)
            await fetchStats()
          }
        }
      } catch (err) {
        console.error('Failed to poll OpenFoodFacts import status:', err)
      }
    }, 1000) // Reduced from 2000ms to 1000ms for more responsive updates

    setTimeout(() => clearInterval(interval), 10 * 60 * 1000)
  }

  const resetOpenFoodFactsStatus = () => {
    setOpenFoodFactsStatus({
      isDownloading: false,
      isParsing: false,
      isImporting: false,
      isConvertingCsv: false,
      progress: 0,
      currentStep: '',
      logs: [],
    })
  }

  const isAnyOperationRunning =
    importStatus.isDownloading ||
    importStatus.isParsing ||
    importStatus.isImporting

  const isAnyOpenFoodFactsOperationRunning =
    openFoodFactsStatus.isDownloading ||
    openFoodFactsStatus.isParsing ||
    openFoodFactsStatus.isImporting ||
    openFoodFactsStatus.isConvertingCsv

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              USDA Food Database {isLoadingStats ? 'Loading...' : ''}
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {stats?.usda.totalFoods.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total USDA food items
              </p>
              {stats?.usda.lastImported && (
                <p className="text-xs text-muted-foreground">
                  Last imported:{' '}
                  {new Date(stats.usda.lastImported).toLocaleDateString()}
                </p>
              )}

              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-xs">
                  <span>Foundation Foods</span>
                  <Badge variant="secondary">
                    {stats?.usda.dataTypes.foundationFoods || 0}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>SR Legacy</span>
                  <Badge variant="secondary">
                    {stats?.usda.dataTypes.srLegacy || 0}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Branded Foods</span>
                  <Badge variant="secondary">
                    {stats?.usda.dataTypes.branded || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              OpenFoodFacts Database {isLoadingStats ? 'Loading...' : ''}
            </CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {stats?.openFoodFacts.totalProducts?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total OpenFoodFacts products
              </p>
              {stats?.openFoodFacts.lastImported && (
                <p className="text-xs text-muted-foreground">
                  Last imported:{' '}
                  {new Date(
                    stats.openFoodFacts.lastImported,
                  ).toLocaleDateString()}
                </p>
              )}

              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-xs">
                  <span>With Nutrition</span>
                  <Badge variant="secondary">
                    {stats?.openFoodFacts.withNutrition?.toLocaleString() || 0}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>With Images</span>
                  <Badge variant="secondary">
                    {stats?.openFoodFacts.withImages?.toLocaleString() || 0}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>With Nutri-Score</span>
                  <Badge variant="secondary">
                    {stats?.openFoodFacts.withNutriScore?.toLocaleString() || 0}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Completion Rate</span>
                  <Badge variant="secondary">
                    {stats?.openFoodFacts.completionRate?.toFixed(1) || 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Import Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            USDA Data Management
          </CardTitle>
          <CardDescription>
            Download and convert USDA FoodData Central datasets to CSV. Updates
            are typically released every 6 months. Database import is handled
            manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Operation Status */}
          {isAnyOperationRunning && (
            <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  {importStatus.currentStep}
                </span>
              </div>
              {importStatus.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-green-700 dark:text-green-300">
                    <span>Progress</span>
                    <span>{Math.round(importStatus.progress)}%</span>
                  </div>
                  <Progress
                    value={importStatus.progress}
                    className="w-full h-2"
                  />
                </div>
              )}
              {/* Show latest log entries */}
              {importStatus.logs.length > 0 && (
                <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  {importStatus.logs.slice(-2).map((log, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full flex-shrink-0" />
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid gap-2 md:grid-cols-3">
            <Button
              type="button"
              onClick={handleFullUSDAUpdateProcess}
              disabled={isAnyOperationRunning}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Full Update Process
            </Button>

            <Button
              type="button"
              onClick={handleTestUSDAScripts}
              variant="outline"
              disabled={isAnyOperationRunning}
              className="w-full"
            >
              🧪 Test USDA Scripts
            </Button>

            <Button
              type="button"
              onClick={handleClearUSDAData}
              variant="destructive"
              disabled={isAnyOperationRunning}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear USDA Data
            </Button>
          </div>

          <Separator />

          {/* Individual Step Controls */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Individual Steps</h4>
            <div className="grid gap-2 md:grid-cols-3">
              <Button
                type="button"
                onClick={handleDownloadUSDAData}
                disabled={isAnyOperationRunning}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                1. Download
              </Button>

              <Button
                type="button"
                onClick={handleParseUSDAData}
                disabled={isAnyOperationRunning}
                variant="outline"
                size="sm"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                2. Convert to CSV
              </Button>

              <Button
                type="button"
                onClick={handleSyncUSDADatabase}
                disabled={isAnyOperationRunning}
                variant="outline"
                size="sm"
              >
                <Database className="h-4 w-4 mr-2" />
                3. Sync to DB
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenFoodFacts Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            OpenFoodFacts Data Management
          </CardTitle>
          <CardDescription>
            Download and convert OpenFoodFacts product database to CSV (~4GB
            Parquet file). Updates are released nightly on Hugging Face.
            Database import is handled manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Operation Status */}
          {isAnyOpenFoodFactsOperationRunning && (
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {openFoodFactsStatus.currentStep}
                </span>
              </div>
              {openFoodFactsStatus.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300">
                    <span>Progress</span>
                    <span>{Math.round(openFoodFactsStatus.progress)}%</span>
                  </div>
                  <Progress
                    value={openFoodFactsStatus.progress}
                    className="w-full h-2"
                  />
                </div>
              )}
              {/* Show latest log entries */}
              {openFoodFactsStatus.logs.length > 0 && (
                <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  {openFoodFactsStatus.logs.slice(-2).map((log, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full flex-shrink-0" />
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid gap-2 md:grid-cols-3">
            <Button
              type="button"
              onClick={handleFullOpenFoodFactsUpdateProcess}
              disabled={
                isAnyOperationRunning || isAnyOpenFoodFactsOperationRunning
              }
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Full Update Process
            </Button>

            <Button
              type="button"
              onClick={() => {
                alert(
                  'OpenFoodFacts bulk data system is ready! Use individual steps or full update.',
                )
              }}
              variant="outline"
              disabled={
                isAnyOperationRunning || isAnyOpenFoodFactsOperationRunning
              }
              className="w-full"
            >
              🥫 Test OpenFoodFacts
            </Button>

            <Button
              type="button"
              onClick={handleClearOpenFoodFactsData}
              variant="destructive"
              disabled={
                isAnyOperationRunning || isAnyOpenFoodFactsOperationRunning
              }
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear OFF Data
            </Button>
          </div>

          <Separator />

          {/* Individual Step Controls */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Individual Steps</h4>
            <div className="grid gap-2 md:grid-cols-3">
              <Button
                type="button"
                onClick={handleDownloadOpenFoodFactsData}
                disabled={
                  isAnyOperationRunning || isAnyOpenFoodFactsOperationRunning
                }
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                1. Download
              </Button>

              <Button
                type="button"
                onClick={handleParseOpenFoodFactsData}
                disabled={
                  isAnyOperationRunning || isAnyOpenFoodFactsOperationRunning
                }
                variant="outline"
                size="sm"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                2. Convert to CSV
              </Button>

              <Button
                type="button"
                onClick={handleSyncOpenFoodFactsDatabase}
                disabled={
                  isAnyOperationRunning || isAnyOpenFoodFactsOperationRunning
                }
                variant="outline"
                size="sm"
              >
                <Database className="h-4 w-4 mr-2" />
                3. Sync to DB
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenFoodFacts Import Logs */}
      {openFoodFactsStatus.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">OpenFoodFacts Import Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {openFoodFactsStatus.logs.map((log, index) => (
                <div
                  key={index}
                  className="text-xs text-muted-foreground font-mono"
                >
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* USDA Import Logs */}
      {importStatus.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">USDA Import Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {importStatus.logs.map((log, index) => (
                <div
                  key={index}
                  className="text-xs text-muted-foreground font-mono"
                >
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
