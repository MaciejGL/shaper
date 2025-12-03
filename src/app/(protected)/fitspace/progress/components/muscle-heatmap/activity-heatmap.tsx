'use client'

import { format, isToday, parseISO } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

import { DayCell, useActivityHeatmap } from './use-activity-heatmap'

function getIntensityLevel(sets: number, maxSets: number): number {
  if (sets === 0) return 0
  const ratio = sets / maxSets
  if (ratio >= 0.8) return 4
  if (ratio >= 0.6) return 3
  if (ratio >= 0.4) return 2
  if (ratio >= 0.2) return 1
  return 1
}

const INTENSITY_CLASSES = [
  'bg-muted',
  'bg-orange-200 dark:bg-orange-900/50',
  'bg-orange-300 dark:bg-orange-800/60',
  'bg-orange-400 dark:bg-orange-700/70',
  'bg-orange-500 dark:bg-orange-600',
]

function Legend() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>Less</span>
      {INTENSITY_CLASSES.map((cls, i) => (
        <div key={i} className={cn('size-3 rounded-sm', cls)} />
      ))}
      <span>More</span>
    </div>
  )
}

interface DailyBreakdownProps {
  days: DayCell[]
  maxSets: number
}

function DailyBreakdown({ days, maxSets }: DailyBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="grid w-full grid-cols-7 gap-1"
    >
      {days.map((day, index) => {
        const level = getIntensityLevel(day.totalSets, maxSets)
        const date = parseISO(day.date)
        const isTodayCell = isToday(date)

        return (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02, duration: 0.15 }}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg p-1.5',
              isTodayCell && 'bg-muted/50',
            )}
          >
            <span className="text-[10px] font-medium text-muted-foreground">
              {day.dayLabel}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {format(date, 'd')}
            </span>
            <div className={cn('size-5 rounded', INTENSITY_CLASSES[level])} />
            <span
              className={cn(
                'text-[10px] font-medium tabular-nums',
                day.totalSets > 0
                  ? 'text-foreground'
                  : 'text-muted-foreground/50',
              )}
            >
              {day.totalSets}
            </span>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

interface ActivityHeatmapProps {
  weekOffset: number
  onWeekOffsetChange: (offset: number) => void
}

export function ActivityHeatmap({
  weekOffset,
  onWeekOffsetChange,
}: ActivityHeatmapProps) {
  const {
    weeks,
    maxSets,
    selectedWeekIndex,
    setSelectedWeekIndex,
    selectedWeekStats,
    orderedDayLabels,
    isLoading,
  } = useActivityHeatmap({ weekOffset, onWeekOffsetChange })

  if (isLoading) {
    return (
      <div className="space-y-3 pt-6">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-40 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Activity</h3>
        {selectedWeekStats && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {selectedWeekStats.weekLabel}
            </span>
            <span className="font-medium text-orange-500">
              {selectedWeekStats.totalSets} sets
            </span>
            <span>{selectedWeekStats.activeDays}/7 days</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedWeekStats && (
          <DailyBreakdown
            key={selectedWeekIndex}
            days={selectedWeekStats.days}
            maxSets={maxSets}
          />
        )}
      </AnimatePresence>

      <div className="flex gap-0.5">
        <div className="flex flex-col gap-1 p-1 pr-1.5">
          {orderedDayLabels.map((label, i) => (
            <div
              key={`label-${i}`}
              className={cn(
                'flex aspect-square items-center text-[10px] text-muted-foreground',
                i % 2 === 1 && 'invisible',
              )}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid flex-1 auto-cols-fr grid-flow-col gap-0.5">
          {weeks.map((week) => {
            const isSelected = week.weekIndex === selectedWeekIndex
            return (
              <button
                key={week.weekStartDate}
                onClick={() => setSelectedWeekIndex(week.weekIndex)}
                className={cn(
                  'flex flex-col gap-1 rounded-md p-1 transition-all',
                  isSelected
                    ? 'bg-muted/10 ring-1 ring-foreground/20'
                    : 'hover:bg-muted/30',
                )}
              >
                {week.days.map((cell) => {
                  const isTodayCell = isToday(parseISO(cell.date))
                  return (
                    <div
                      key={cell.date}
                      className={cn(
                        'aspect-square w-full rounded transition-all',
                        INTENSITY_CLASSES[
                          getIntensityLevel(cell.totalSets, maxSets)
                        ],
                        isTodayCell &&
                          'ring-1 ring-foreground ring-offset-1 ring-offset-background',
                      )}
                    />
                  )
                })}
              </button>
            )
          })}
        </div>
      </div>

      <Legend />
    </div>
  )
}
