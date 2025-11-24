'use client'

import { motion } from 'framer-motion'
import { Award, Flame, Target, Trophy } from 'lucide-react'

import { cn } from '@/lib/utils'

import { AchievementBadge } from './types'

interface AchievementBadgesProps {
  adherence: number
  workoutsCompleted: number
  totalWorkouts: number
}

function getBadges(
  adherence: number,
  workoutsCompleted: number,
  totalWorkouts: number,
): AchievementBadge[] {
  const badges: AchievementBadge[] = []

  if (adherence === 100) {
    badges.push({
      id: 'perfect',
      title: 'Perfect Adherence',
      icon: Trophy,
      gradient: 'from-amber-400 to-yellow-600',
    })
  }

  if (adherence >= 90) {
    badges.push({
      id: 'consistency',
      title: 'Consistency Champion',
      icon: Flame,
      gradient: 'from-orange-400 to-red-600',
    })
  }

  if (workoutsCompleted === totalWorkouts) {
    badges.push({
      id: 'goal',
      title: 'Goal Crusher',
      icon: Target,
      gradient: 'from-green-400 to-emerald-600',
    })
  }

  if (badges.length === 0) {
    badges.push({
      id: 'athlete',
      title: 'Dedicated Athlete',
      icon: Award,
      gradient: 'from-purple-400 to-pink-600',
    })
  }

  return badges
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const item = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
    },
  },
}

export function AchievementBadges({
  adherence,
  workoutsCompleted,
  totalWorkouts,
}: AchievementBadgesProps) {
  const badges = getBadges(adherence, workoutsCompleted, totalWorkouts)

  return (
    <motion.div
      className="grid grid-cols-2 gap-3"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {badges.map((badge) => {
        const Icon = badge.icon
        return (
          <motion.div
            key={badge.id}
            variants={item}
            className={cn(
              'relative overflow-hidden rounded-xl p-4 flex flex-col items-center gap-2',
              'bg-gradient-to-br',
              badge.gradient,
              'shadow-lg',
            )}
          >
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="size-10 flex-center rounded-full bg-white/20 backdrop-blur-sm">
                <Icon className="size-5 text-white" />
              </div>
              <p className="text-xs font-medium text-white text-center">
                {badge.title}
              </p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
