import { useCallback, useEffect, useState } from 'react'

import { Loader } from '@/components/loader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ClientStatsProps {
  clientId: string
  trainerId: string
}

export function ClientStats({ clientId, trainerId }: ClientStatsProps) {
  const [stats, setStats] = useState<{
    totalSpent: number
    totalCommission: number
    completedPurchases: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/trainer/client-stats?clientId=${clientId}&trainerId=${trainerId}`,
      )
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [clientId, trainerId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center">
            <Loader />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-semibold">
              {Number(stats.totalSpent).toLocaleString('no-NO')}
              <span className="text-xs text-muted-foreground">NOK</span>
            </p>
            <p className="text-xs text-muted-foreground">Total spent</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-primary">
              {Number(stats.totalCommission).toLocaleString('no-NO')}
              <span className="text-xs text-muted-foreground">NOK</span>
            </p>
            <p className="text-xs text-muted-foreground">Your earnings</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Purchases</span>
            <span className="font-medium">{stats.completedPurchases}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

