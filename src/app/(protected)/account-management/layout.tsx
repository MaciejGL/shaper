import {
  type GQLGetMyMacroTargetsQuery,
  type GQLGetMyNutritionPlansQuery,
  GetMyMacroTargetsDocument,
  GetMyNutritionPlansDocument,
} from '@/generated/graphql-client'
import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'
import { gqlServerFetch } from '@/lib/gqlServerFetch'
import { cn } from '@/lib/utils'

import { WebNavbar } from './components/web-navbar'
import { SafeMobileNav } from './safe-mobile-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  requireAuth(GQLUserRole.Client, user)

  // Fetch nutrition eligibility server-side to avoid flicker
  const [macroResult, plansResult] = await Promise.all([
    gqlServerFetch<GQLGetMyMacroTargetsQuery>(GetMyMacroTargetsDocument),
    gqlServerFetch<GQLGetMyNutritionPlansQuery>(GetMyNutritionPlansDocument),
  ])

  const macroTargets = macroResult.data?.getMyMacroTargets
  const hasPlans = (plansResult.data?.nutritionPlans?.length ?? 0) > 0
  const hasMacroTargets = !!(
    macroTargets?.calories ||
    macroTargets?.protein ||
    macroTargets?.carbs ||
    macroTargets?.fat
  )
  const hasNutritionAccess = hasPlans || hasMacroTargets

  return (
    <div className="w-full h-screen flex flex-col">
      <WebNavbar />
      <div
        className={cn(
          'w-full p-4 md:p-4 lg:p-8 bg-background safe-area-bottom',
        )}
      >
        {children}
        <div className="h-40" />
      </div>

      <SafeMobileNav hasNutritionAccess={hasNutritionAccess} />
    </div>
  )
}
