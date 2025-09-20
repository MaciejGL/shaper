/**
 * Client nutrition component
 * Displays nutrition plans and macro targets for a specific client
 */

'use client'

import { ClientMacroTargets } from '../client-macro-targets'

import { NutritionPlansSection } from './nutrition-plans-section'

/**
 * Client nutrition component
 * Displays nutrition plans and macro targets for a specific client
 */

/**
 * Client nutrition component
 * Displays nutrition plans and macro targets for a specific client
 */

interface ClientNutritionProps {
  clientId: string
}

export function ClientNutrition({ clientId }: ClientNutritionProps) {
  return (
    <div className="space-y-8">
      <ClientMacroTargets clientId={clientId} />
      <NutritionPlansSection clientId={clientId} />
    </div>
  )
}
