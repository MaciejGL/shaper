import {
  EmailButton,
  EmailCard,
  EmailContent,
  EmailFooter,
  EmailHeader,
  EmailHeading,
  EmailText,
  EmailWrapper,
} from './components'

interface WeeklyProgressEmailProps {
  userName?: string | null
  upgradeUrl: string
  workoutCount: number
  totalSets: number
  exerciseCount: number
  topMuscleGroups: string[]
}

export const WeeklyProgressEmail = ({
  userName,
  upgradeUrl,
  workoutCount,
  totalSets,
  exerciseCount,
  topMuscleGroups,
}: WeeklyProgressEmailProps) => (
  <EmailWrapper
    previewText={`Your week: ${workoutCount} workouts, ${totalSets} sets logged`}
  >
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Hey ${userName}!` : 'Your training week'}
      </EmailHeading>

      <EmailText>Here's what you accomplished in your first week:</EmailText>

      <EmailCard>
        <EmailText
          size="14px"
          weight="600"
          style={{ marginBottom: '12px', color: '#18181b' }}
        >
          This Week
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • {workoutCount} workouts completed
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • {totalSets} total sets
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • {exerciseCount} different exercises
        </EmailText>
        {topMuscleGroups.length > 0 && (
          <EmailText size="14px" color="muted" style={{ marginBottom: '0' }}>
            • Most trained: {topMuscleGroups.slice(0, 3).join(', ')}
          </EmailText>
        )}
      </EmailCard>

      <EmailText weight="600">What full access members see:</EmailText>

      <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
        <strong>Volume Analysis</strong> - "You hit 45 sets this week. Chest got
        18 sets (great!), but shoulders only got 6. Consider adding lateral
        raises."
      </EmailText>

      <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
        <strong>PR Alerts</strong> - "New PR! Bench Press: 80kg x 8 reps - up
        from 75kg last month"
      </EmailText>

      <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
        <strong>Smart Recommendations</strong> - Based on your training, we'd
        suggest focusing on specific areas next week.
      </EmailText>

      <EmailText size="14px" color="muted" style={{ marginBottom: '16px' }}>
        <strong>Premium Training Plans</strong> - Follow structured programs
        like "12-Week Strength Builder" or "Push/Pull/Legs" - designed by
        coaches, ready to use.
      </EmailText>

      <EmailButton href={upgradeUrl}>Unlock Your Full Stats</EmailButton>

      <EmailText size="14px" color="muted">
        See you in the gym,
        <br />
        Hypro
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
