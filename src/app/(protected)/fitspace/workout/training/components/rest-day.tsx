'use client'

import { CoffeeIcon, ScaleIcon, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'

import { BiggyIcon } from '@/components/biggy-icon'
import { ButtonLink } from '@/components/ui/button-link'
import { useUser } from '@/context/user-context'
import { useBodyMeasuresQuery } from '@/generated/graphql-client'

interface RecoveryTip {
  title: string
  description: string
}

const RECOVERY_TIPS: RecoveryTip[] = [
  {
    title: 'Sleep is your superpower',
    description:
      'Aim for 7-9 hours tonight. Most muscle repair happens during deep sleep, so prioritize getting to bed on time.',
  },
  {
    title: 'Protein timing matters',
    description:
      'Space your protein intake throughout the day. Your muscles continue rebuilding for 24-48 hours after training.',
  },
  {
    title: 'Stay hydrated',
    description:
      'Drink plenty of water today. Hydration supports nutrient delivery to muscles and helps flush metabolic waste.',
  },
  {
    title: 'Move gently',
    description:
      'Light movement like walking or stretching promotes blood flow and can speed up recovery without adding stress.',
  },
  {
    title: 'Fuel your recovery',
    description:
      'Eat enough calories today. Your body needs energy to repair tissue and come back stronger for your next session.',
  },
  {
    title: 'Manage stress',
    description:
      'High stress delays recovery. Take time to unwind - read, meditate, or spend time with people you enjoy.',
  },
  {
    title: 'Stretch it out',
    description:
      'Gentle stretching or foam rolling can reduce muscle tightness and improve mobility for your next workout.',
  },
  {
    title: 'Listen to your body',
    description:
      'Rest days exist for a reason. If you feel extra tired, lean into it. Recovery is when gains are made.',
  },
]

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

function getTodaysTip(): RecoveryTip {
  const dayOfYear = getDayOfYear()
  const index = dayOfYear % RECOVERY_TIPS.length
  return RECOVERY_TIPS[index]
}

function getDaysSinceLastLog(measuredAt: string): number {
  const lastDate = new Date(measuredAt)
  const today = new Date()
  const diffTime = today.getTime() - lastDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

interface TrackingReminderMessage {
  title: string
  description: string
}

function getTrackingMessage(
  daysSinceLastLog: number | null,
): TrackingReminderMessage {
  if (daysSinceLastLog === null) {
    return {
      title: 'Start tracking your progress',
      description:
        'Log your first weigh-in to track changes over time and see how your training is paying off.',
    }
  }

  if (daysSinceLastLog <= 3) {
    return {
      title: 'Keep up the consistency',
      description: `You logged ${daysSinceLastLog === 0 ? 'today' : daysSinceLastLog === 1 ? 'yesterday' : `${daysSinceLastLog} days ago`}. Regular tracking helps you spot trends.`,
    }
  }

  if (daysSinceLastLog <= 7) {
    return {
      title: 'Time for a check-in?',
      description: `It's been ${daysSinceLastLog} days since your last log. A quick weigh-in keeps your progress visible.`,
    }
  }

  if (daysSinceLastLog <= 14) {
    return {
      title: 'Your progress is waiting',
      description: `${daysSinceLastLog} days since your last log. Take a moment to check in and see how far you've come.`,
    }
  }

  return {
    title: 'Pick up where you left off',
    description: `It's been a while since you tracked. A fresh measurement can kickstart your momentum.`,
  }
}

export function RestDay() {
  const tip = getTodaysTip()
  const { hasPremium } = useUser()

  const { data: bodyMeasuresData } = useBodyMeasuresQuery(
    {},
    {
      staleTime: 5 * 60 * 1000,
      enabled: hasPremium,
    },
  )

  const trackingInfo = useMemo(() => {
    if (!hasPremium) {
      return {
        daysSinceLastLog: null,
        message: {
          title: 'Track your transformation',
          description:
            'Premium members can log weight, measurements, and progress photos to visualize their journey.',
        },
      }
    }

    const measures = bodyMeasuresData?.bodyMeasures
    if (!measures || measures.length === 0) {
      return {
        daysSinceLastLog: null,
        message: getTrackingMessage(null),
      }
    }

    const sortedMeasures = [...measures].sort(
      (a, b) =>
        new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
    )
    const lastMeasure = sortedMeasures[0]
    const daysSince = getDaysSinceLastLog(lastMeasure.measuredAt)

    return {
      daysSinceLastLog: daysSince,
      message: getTrackingMessage(daysSince),
    }
  }, [bodyMeasuresData, hasPremium])

  return (
    <div className="text-center p-6 text-muted-foreground flex-center flex-col pt-12 space-y-6">
      <div className="flex-center flex-col">
        <BiggyIcon icon={CoffeeIcon} />
        <p className="text-lg font-medium mb-2 mt-2 text-foreground">
          Rest up today
        </p>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border max-w-sm">
        <p className="text-sm font-medium text-foreground mb-1">{tip.title}</p>
        <p className="text-sm leading-relaxed">{tip.description}</p>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border max-w-sm w-full">
        <div className="flex items-start gap-3 text-left mb-4">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <ScaleIcon className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {trackingInfo.message.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {trackingInfo.message.description}
            </p>
          </div>
        </div>

        <ButtonLink
          href="/fitspace/progress"
          variant="default"
          size="sm"
          className="w-full"
          iconStart={<TrendingUp />}
        >
          {hasPremium ? 'Log Progress' : 'View Progress'}
        </ButtonLink>
      </div>
    </div>
  )
}
