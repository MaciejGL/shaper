'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

import { AnimateNumber } from '@/components/animate-number'
import { Card } from '@/components/ui/card'
import { SectionGradient } from '@/components/ui/section-gradient'
import { cn } from '@/lib/utils'

type UserStats = {
  activeUsers: number
  avgWorkouts: number
  avgExercises: number
  avgSets: number
  avgReps: number
  avgPRs: number
  updatedAt: string
}

async function getUserStats(): Promise<UserStats> {
  const res = await fetch('/api/user-stats', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch user stats')
  return res.json()
}

function StatCard({
  value,
  label,
  loading,
  delay = 0,
  className,
}: {
  value: number
  label: string
  loading: boolean
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay }}
      className={className}
    >
      <Card
        variant="glass"
        className={cn('px-5 py-4', 'flex flex-col gap-1.5', 'shadow-none')}
      >
        <div
          className={cn(
            'text-3xl md:text-4xl font-semibold tracking-tight text-foreground tabular-nums',
            loading && 'masked-placeholder-text',
          )}
        >
          <AnimateNumber value={value} isPending={loading} />
        </div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
      </Card>
    </motion.div>
  )
}

export function UserStatsSection() {
  const { data } = useQuery({
    queryKey: ['user-stats'],
    queryFn: getUserStats,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })

  return (
    <section className="py-24 px-4 relative overflow-hidden dark bg-background text-foreground">
      <SectionGradient />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col items-center text-center gap-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
            From zero to personal records
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl">
            Average results after sticking with the plan. We keep you on track —
            you show up, and the progress follows.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:flex md:flex-wrap md:justify-center xl:grid xl:grid-cols-5">
          <StatCard
            className="max-md:col-span-full max-md:mx-auto max-md:w-1/2 md:w-[calc((100%-2rem)/3)] xl:w-full"
            value={data?.avgPRs ?? 0}
            label="Personal Records"
            loading={false}
            delay={0.05}
          />
          <StatCard
            className="md:w-[calc((100%-2rem)/3)] xl:w-full"
            value={data?.avgWorkouts ?? 0}
            label="Workouts"
            loading={false}
            delay={0.1}
          />
          <StatCard
            className="md:w-[calc((100%-2rem)/3)] xl:w-full"
            value={data?.avgExercises ?? 0}
            label="Exercises"
            loading={false}
            delay={0.15}
          />
          <StatCard
            className="md:w-[calc((100%-2rem)/3)] xl:w-full"
            value={data?.avgSets ?? 0}
            label="Sets"
            loading={false}
            delay={0.2}
          />
          <StatCard
            className="md:w-[calc((100%-2rem)/3)] xl:w-full"
            value={data?.avgReps ?? 0}
            label="Reps"
            loading={false}
            delay={0.25}
          />
        </div>
      </div>
    </section>
  )
}
