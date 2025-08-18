'use client'

import { Check } from 'lucide-react'

interface PremiumBenefitsListProps {
  benefits: readonly string[]
  variant?: 'green' | 'orange' | 'white'
  className?: string
}

export function PremiumBenefitsList({
  benefits,
  variant = 'green',
  className = '',
}: PremiumBenefitsListProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'orange':
        return {
          checkIcon: 'text-orange-600',
          text: 'text-orange-800 dark:text-orange-200',
        }
      case 'white':
        return {
          checkIcon: 'text-white',
          text: 'text-white',
        }
      case 'green':
      default:
        return {
          checkIcon: 'text-green-600',
          text: 'text-green-800 dark:text-green-200',
        }
    }
  }

  const classes = getVariantClasses()

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${className}`}>
      {benefits.map((benefit, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Check className={`w-4 h-4 ${classes.checkIcon}`} />
          <span className={`text-sm ${classes.text}`}>{benefit}</span>
        </div>
      ))}
    </div>
  )
}

// Predefined benefit lists
export const PREMIUM_BENEFITS = [
  'Unlimited training plans',
  'Full meal plan access',
  'Premium exercise library',
  'Advanced analytics',
] as const

export const UPGRADE_BENEFITS = [
  'Unlimited training plans',
  'Access to premium exercises library',
  'Full meal plan access',
  'Premium training plan templates',
  'Advanced progress analytics',
  'Priority customer support',
] as const
