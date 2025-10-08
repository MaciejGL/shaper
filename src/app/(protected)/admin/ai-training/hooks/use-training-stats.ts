import { useEffect, useState } from 'react'

import type { TrainingStats } from '@/lib/ai-training/types'

export function useTrainingStats() {
  const [stats, setStats] = useState<TrainingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/ai-training/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    isLoading,
    refreshStats: fetchStats,
  }
}
