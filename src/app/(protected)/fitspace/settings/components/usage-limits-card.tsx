'use client'

interface UsageLimitsCardProps {
  trainingPlanLimit: number
  canAccessMealPlans: boolean
  canAccessPremiumExercises: boolean
}

export function UsageLimitsCard({
  trainingPlanLimit,
  canAccessMealPlans,
  canAccessPremiumExercises,
}: UsageLimitsCardProps) {
  return (
    <div className="p-6 bg-zinc-300 dark:bg-gray-800/50 rounded-lg">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Usage & Limits
      </h4>
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Training Plans:</span>{' '}
          {trainingPlanLimit === -1
            ? 'Unlimited'
            : `Limited to ${trainingPlanLimit || 1}`}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Meal Plans:</span>{' '}
          {canAccessMealPlans ? 'Full Access' : 'Premium Required'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Premium Exercises:</span>{' '}
          {canAccessPremiumExercises ? 'Full Access' : 'Premium Required'}
        </p>
      </div>
    </div>
  )
}
