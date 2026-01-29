import { OnboardingTour } from '@/app/(protected)/fitspace/components/onboarding-tour/onboarding-tour'
import { Main } from '@/components/main'
import {
  type GQLGetMyMacroTargetsQuery,
  type GQLGetMyNutritionPlansQuery,
  GetMyMacroTargetsDocument,
  GetMyNutritionPlansDocument,
} from '@/generated/graphql-client'
import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { FitspaceNativeGate } from './components/fitspace-native-gate'
import { MobileNav } from './components/mobile-nav'

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
    <Main user={user}>
      <FitspaceNativeGate>
        {children}
        <MobileNav hasNutritionAccess={hasNutritionAccess} />
        <OnboardingTour />
      </FitspaceNativeGate>
    </Main>
  )
}
