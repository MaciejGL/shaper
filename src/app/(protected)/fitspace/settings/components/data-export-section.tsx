'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export function DataExportSection() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/user/export')

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the blob and create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hypro-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center">
            <Download className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground">
              Export Your Data
            </div>
            <div className="text-sm text-muted-foreground">
              Download all your personal data as a JSON file
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          loading={isExporting}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground px-1">
        Includes your profile, body measurements, workout history, training
        plans, nutrition data, and progress photos.
      </p>
    </div>
  )
}
