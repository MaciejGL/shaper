'use client'

import { Check } from 'lucide-react'

import { BadgeProps } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PremiumBenefitsListProps {
  benefits: readonly string[]
  variant?: BadgeProps['variant']
  className?: string
}

export function PremiumBenefitsList({
  benefits,
  variant = 'premium',
  className = '',
}: PremiumBenefitsListProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'warning':
        return {
          checkIcon: 'text-orange-600',
          text: 'text-orange-800 dark:text-orange-200',
        }
      case 'secondary':
        return {
          checkIcon: 'text-green-600',
          text: 'text-white',
        }
      case 'premium':
      default:
        return {
          checkIcon: 'text-green-600',
          text: 'text-green-800 dark:text-green-200',
        }
    }
  }

  const classes = getVariantClasses()

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-3', className)}>
      {benefits.map((benefit, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Check className={cn('w-4 h-4', classes.checkIcon)} />
          <span className={cn('text-sm', classes.text)}>{benefit}</span>
        </div>
      ))}
    </div>
  )
}

// Predefined benefit lists
export const PREMIUM_BENEFITS = [
  'Premium training plans',
  'Premium exercise library',
  'Unlimited training plans',
  'Advanced analytics',
  'Personal Record tracking',
] as const

export const UPGRADE_BENEFITS = [
  'Premium training plans',
  'Premium exercise library',
  'Unlimited training plans',
  'Advanced analytics',
  'Personal Record tracking',
] as const
