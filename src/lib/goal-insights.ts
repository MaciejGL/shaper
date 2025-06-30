import { GQLGoal } from '@/generated/graphql-client'

interface ProgressData {
  weightTrend: number
  avgProteinIntake: number
  bodyWeight: number
  weeklyVolumeIncrease: number
}

interface Insight {
  type: 'warning' | 'suggestion' | 'success'
  message: string
  action: string
}

// Intelligent recommendations based on user goals and progress
export function generateGoalInsights(
  userGoals: GQLGoal[],
  progressData: ProgressData,
) {
  const insights: Insight[] = []

  userGoals.forEach((goal) => {
    switch (goal) {
      case 'LOSE_WEIGHT':
        if (progressData.weightTrend > 0) {
          insights.push({
            type: 'warning',
            message:
              'Weight trending upward. Consider increasing cardio or reviewing nutrition.',
            action: 'Add 2 extra cardio sessions this week',
          })
        }
        break

      case 'GAIN_MUSCLE':
        if (progressData.avgProteinIntake < 1.6 * progressData.bodyWeight) {
          insights.push({
            type: 'suggestion',
            message: 'Protein intake might be too low for muscle gain goals.',
            action: 'Target 2g protein per kg body weight',
          })
        }
        break

      case 'INCREASE_STRENGTH':
        if (progressData.weeklyVolumeIncrease < 2.5) {
          insights.push({
            type: 'suggestion',
            message:
              'Consider progressive overload - increase weights by 2.5-5% weekly.',
            action: 'Add 2.5kg to your main lifts this week',
          })
        }
        break
    }
  })

  return insights
}
