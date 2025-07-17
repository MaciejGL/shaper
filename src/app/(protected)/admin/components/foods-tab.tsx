'use client'

import {
  AlertCircle,
  Database,
  Download,
  FileText,
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
    cachedProducts: number
    lastCached: string | null
  }
}

interface ImportStatus {
  isDownloading: boolean
  isParsing: boolean
  isImporting: boolean
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

  const handleImportToDatabase = async () => {
    try {
      setImportStatus((prev) => ({
        ...prev,
        isImporting: true,
        currentStep: 'Importing data to database...',
        logs: [...prev.logs, 'Starting database import...'],
      }))

      const response = await fetch('/api/admin/usda-import', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to start import')

      pollImportStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setImportStatus((prev) => ({ ...prev, isImporting: false }))
    }
  }

  const handleFullUpdateProcess = async () => {
    try {
      setError(null) // Clear any previous errors
      setImportStatus((prev) => ({
        ...prev,
        isDownloading: true,
        currentStep: 'Starting full USDA data update...',
        logs: [...prev.logs, 'Starting full USDA data update process...'],
      }))

      const response = await fetch('/api/admin/usda-full-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const responseData = await response.text()

      if (!response.ok) {
        throw new Error(
          `Failed to start full update: ${response.status} - ${responseData}`,
        )
      }

      pollImportStatus()
    } catch (err) {
      console.error('Full update error:', err)
      setError(err instanceof Error ? err.message : 'Full update failed')
      resetImportStatus()
    }
  }

  const handleTestScript = async () => {
    try {
      setError(null)

      const response = await fetch('/api/admin/test-script', {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(`Test failed: ${result.error}`)
      }

      alert(
        `Test successful!\nTSX: ${result.tsxVersion}\nNode: ${result.nodeVersion}\nScript output: ${result.scriptOutput || 'No output'}`,
      )
    } catch (err) {
      console.error('Test error:', err)
      setError(err instanceof Error ? err.message : 'Test failed')
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
    }, 2000)

    // Clear interval after 10 minutes to prevent infinite polling
    setTimeout(() => clearInterval(interval), 10 * 60 * 1000)
  }

  const resetImportStatus = () => {
    setImportStatus({
      isDownloading: false,
      isParsing: false,
      isImporting: false,
      progress: 0,
      currentStep: '',
      logs: [],
    })
  }

  const isAnyOperationRunning =
    importStatus.isDownloading ||
    importStatus.isParsing ||
    importStatus.isImporting

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
              OpenFoodFacts Cache
            </CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {stats?.openFoodFacts.cachedProducts.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Cached OpenFoodFacts products
              </p>
              {stats?.openFoodFacts.lastCached && (
                <p className="text-xs text-muted-foreground">
                  Last cached:{' '}
                  {new Date(
                    stats.openFoodFacts.lastCached,
                  ).toLocaleDateString()}
                </p>
              )}
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
            Download, parse, and import USDA FoodData Central datasets. Updates
            are typically released every 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Operation Status */}
          {isAnyOperationRunning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">
                  {importStatus.currentStep}
                </span>
              </div>
              {importStatus.progress > 0 && (
                <Progress value={importStatus.progress} className="w-full" />
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid gap-2 md:grid-cols-3">
            <Button
              type="button"
              onClick={handleFullUpdateProcess}
              disabled={isAnyOperationRunning}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Full Update Process
            </Button>

            <Button
              type="button"
              onClick={handleTestScript}
              variant="outline"
              disabled={isAnyOperationRunning}
              className="w-full"
            >
              🧪 Test Scripts
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
                <FileText className="h-4 w-4 mr-2" />
                2. Parse
              </Button>

              <Button
                type="button"
                onClick={handleImportToDatabase}
                disabled={isAnyOperationRunning}
                variant="outline"
                size="sm"
              >
                <Database className="h-4 w-4 mr-2" />
                3. Import
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Logs */}
      {importStatus.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Import Logs</CardTitle>
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
