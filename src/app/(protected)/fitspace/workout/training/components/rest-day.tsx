import { CoffeeIcon } from 'lucide-react'

import { BiggyIcon } from '@/components/biggy-icon'

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

export function RestDay() {
  const tip = getTodaysTip()

  return (
    <div className="text-center p-6 text-muted-foreground flex-center flex-col pt-16">
      <BiggyIcon icon={CoffeeIcon} />
      <p className="text-lg font-medium mb-2 mt-6 text-foreground">
        Rest up today
      </p>

      <div className="mt-4 p-4 rounded-xl bg-muted/50 max-w-sm">
        <p className="text-sm font-medium text-foreground mb-1">{tip.title}</p>
        <p className="text-sm leading-relaxed">{tip.description}</p>
      </div>
    </div>
  )
}
