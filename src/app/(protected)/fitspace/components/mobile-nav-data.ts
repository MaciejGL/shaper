import {
  Dumbbell,
  type LucideIcon,
  MoreHorizontal,
  SaladIcon,
} from 'lucide-react'
import { BsFillPersonCheckFill } from 'react-icons/bs'
import { FaClipboardList } from 'react-icons/fa'
import { FaArrowTrendUp } from 'react-icons/fa6'
import { IoSearch } from 'react-icons/io5'
import { IconType } from 'react-icons/lib'

export interface NavItem {
  id: string
  href: string
  icon: LucideIcon | IconType
  label: string
  prefetch: boolean
  onboardingId?: string
}

interface NavItemsConfig {
  trainingId?: string
  weekId: string | null
  dayId: string | null
  hasNutritionAccess: boolean
}

export function getNavItems({
  trainingId,
  weekId,
  dayId,
  hasNutritionAccess,
}: NavItemsConfig): { primaryItems: NavItem[]; moreItems: NavItem[] } {
  const workoutHref = trainingId
    ? `/fitspace/workout?week=${weekId || ''}&day=${dayId || ''}`
    : '/fitspace/workout'

  const allItems: NavItem[] = [
    {
      id: 'workout',
      href: workoutHref,
      icon: Dumbbell,
      label: 'Workout',
      prefetch: true,
      onboardingId: 'nav-workout',
    },
    {
      id: 'plans',
      href: '/fitspace/my-plans',
      icon: FaClipboardList,
      label: 'My Plans',
      prefetch: true,
      onboardingId: 'nav-my-plans',
    },
    {
      id: 'progress',
      href: '/fitspace/progress',
      icon: FaArrowTrendUp,
      label: 'Progress',
      prefetch: true,
      onboardingId: 'nav-progress',
    },
  ]

  // Nutrition is a primary tab when user has access
  if (hasNutritionAccess) {
    allItems.push({
      id: 'nutrition',
      href: '/fitspace/nutrition',
      icon: SaladIcon,
      label: 'Nutrition',
      prefetch: true,
    })
  }

  // Items that go in the "More" menu
  const moreItems: NavItem[] = [
    {
      id: 'trainer',
      href: '/fitspace/my-trainer',
      icon: BsFillPersonCheckFill,
      label: 'My Trainer',
      prefetch: true,
    },
    {
      id: 'discover',
      href: '/fitspace/explore',
      icon: IoSearch,
      label: 'Plans & Trainers',
      prefetch: true,
      onboardingId: 'nav-explore',
    },
  ]

  return { primaryItems: allItems, moreItems }
}

export const MoreIcon = MoreHorizontal
