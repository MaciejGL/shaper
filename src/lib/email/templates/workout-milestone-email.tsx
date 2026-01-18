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

interface WorkoutMilestoneEmailProps {
  userName?: string | null
  upgradeUrl: string
  totalSets: number
  exerciseCount: number
  topExercises: string[]
}

export const WorkoutMilestoneEmail = ({
  userName,
  upgradeUrl,
  totalSets,
  exerciseCount,
  topExercises,
}: WorkoutMilestoneEmailProps) => (
  <EmailWrapper previewText="Nice work on workout #3 - here's your progress">
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Nice work, ${userName}!` : 'Nice work on workout #3!'}
      </EmailHeading>

      <EmailText>3 workouts done. You're building a habit.</EmailText>

      <EmailCard>
        <EmailText
          size="14px"
          weight="600"
          style={{ marginBottom: '12px', color: '#18181b' }}
        >
          Your Stats So Far
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • {totalSets} total sets completed
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • {exerciseCount} exercises performed
        </EmailText>
        {topExercises.length > 0 && (
          <EmailText size="14px" color="muted" style={{ marginBottom: '0' }}>
            • Top exercises: {topExercises.slice(0, 3).join(', ')}
          </EmailText>
        )}
      </EmailCard>

      <EmailText weight="600">With full access, you'd also see:</EmailText>

      <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
        <strong>PR Tracking</strong> - Did you hit a personal record? Full
        access automatically detects when you lift more than before and
        celebrates your wins.
      </EmailText>

      <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
        <strong>Muscle Volume Breakdown</strong> - See exactly which muscle
        groups you're training most - and which might need more attention.
      </EmailText>

      <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
        <strong>Progress Over Time</strong> - Watch your strength grow week by
        week with visual charts.
      </EmailText>

      <EmailText size="14px" color="muted" style={{ marginBottom: '16px' }}>
        Plus: Access to premium training plans designed by coaches - no more
        guessing what to do next.
      </EmailText>

      <EmailButton href={upgradeUrl}>Start 7-Day Free Trial</EmailButton>

      <EmailText size="14px" color="muted">
        Keep pushing,
        <br />
        Hypro
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
