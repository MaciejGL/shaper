'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

import { AnimateNumber } from '@/components/animate-number'
import { Card } from '@/components/ui/card'
import { SectionGradient } from '@/components/ui/section-gradient'
import { cn } from '@/lib/utils'

type PlatformStats = {
  workoutsCompleted: number
  exercisesCompleted: number
  setsCompleted: number
  repsPerformed: number
  updatedAt: string
}

async function getPlatformStats(): Promise<PlatformStats> {
  const res = await fetch('/api/platform-stats', { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to fetch platform stats')
  }
  return res.json()
}

function StatCard({
  value,
  label,
  delay = 0,
}: {
  value: number
  label: string
  loading: boolean
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        variant="glass"
        className={cn('px-5', 'flex flex-col gap-1.5', 'shadow-none')}
      >
        <div
          className={cn(
            'text-3xl md:text-4xl font-semibold tracking-tight text-foreground tabular-nums',
          )}
        >
          <AnimateNumber value={value} />
        </div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
      </Card>
    </motion.div>
  )
}

export function PlatformStatsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: getPlatformStats,
    staleTime: 20_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })

  return (
    <section className="py-24 px-4 relative overflow-hidden dark bg-background text-foreground">
      <SectionGradient />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col gap-3 text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight"
          >
            Proof beats motivation
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto"
          >
            Log the work. Watch the numbers climb.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            value={data?.workoutsCompleted ?? 0}
            label="Workouts"
            loading={isLoading}
            delay={0.2}
          />
          <StatCard
            value={data?.exercisesCompleted ?? 0}
            label="Exercises"
            loading={isLoading}
            delay={0.3}
          />
          <StatCard
            value={data?.setsCompleted ?? 0}
            label="Sets"
            loading={isLoading}
            delay={0.4}
          />
          <StatCard
            value={data?.repsPerformed ?? 0}
            label="Reps"
            loading={isLoading}
            delay={0.5}
          />
        </div>
      </div>
    </section>
  )
}
