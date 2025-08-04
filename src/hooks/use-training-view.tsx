import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLTrainingView } from '@/generated/graphql-client'

export function useTrainingView() {
  const { preferences } = useUserPreferences()

  const isSimpleView = preferences.trainingView === GQLTrainingView.Simple
  const isAdvancedView = preferences.trainingView === GQLTrainingView.Advanced

  return {
    trainingView: preferences.trainingView,
    isSimpleView,
    isAdvancedView,
  }
}
