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

interface WinbackEmailProps {
  userName?: string | null
  upgradeUrl: string
  daysSinceLastWorkout: number
  totalWorkouts: number
  lastWorkoutName?: string | null
  lastWorkoutDate?: string | null
  topLifts: { name: string; weight: number; unit: string }[]
}

export const WinbackEmail = ({
  userName,
  upgradeUrl,
  daysSinceLastWorkout,
  totalWorkouts,
  lastWorkoutName,
  lastWorkoutDate,
  topLifts,
}: WinbackEmailProps) => (
  <EmailWrapper
    previewText={`Your last workout was ${daysSinceLastWorkout} days ago`}
  >
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Hey ${userName}!` : "It's been a while"}
      </EmailHeading>

      <EmailText>
        It's been {daysSinceLastWorkout} days since your last session. No
        judgment - life gets busy.
      </EmailText>

      <EmailCard>
        <EmailText
          size="14px"
          weight="600"
          style={{ marginBottom: '12px', color: '#18181b' }}
        >
          Your Progress Before the Break
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • {totalWorkouts} total workouts logged
        </EmailText>
        {lastWorkoutName && lastWorkoutDate && (
          <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
            • Last session: {lastWorkoutName} on {lastWorkoutDate}
          </EmailText>
        )}
        {topLifts.length > 0 && (
          <EmailText size="14px" color="muted" style={{ marginBottom: '0' }}>
            • Top lifts:{' '}
            {topLifts.map((l) => `${l.name} ${l.weight}${l.unit}`).join(', ')}
          </EmailText>
        )}
      </EmailCard>

      <EmailText weight="600">
        When you're ready to get back, full access makes it easier:
      </EmailText>

      <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
        <strong>Premium Training Plans</strong> - Don't know where to start?
        Follow a structured program:
      </EmailText>
      <EmailText size="14px" color="muted" style={{ marginBottom: '4px' }}>
        • "Back to Basics" - 3 days/week, perfect for rebuilding
      </EmailText>
      <EmailText size="14px" color="muted" style={{ marginBottom: '4px' }}>
        • "Full Body Strength" - hit everything in fewer sessions
      </EmailText>
      <EmailText size="14px" color="muted" style={{ marginBottom: '16px' }}>
        • "Push/Pull/Legs" - classic split, coach-designed
      </EmailText>

      <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
        <strong>Pick Up Where You Left Off</strong> - See your previous weights
        and sets so you know exactly what to load on the bar.
      </EmailText>

      <EmailText size="14px" color="muted" style={{ marginBottom: '16px' }}>
        <strong>Track Your Comeback</strong> - Watch your strength return with
        PR tracking and progress charts.
      </EmailText>

      <EmailText style={{ marginBottom: '16px' }}>
        Start with a 7-day free trial - cancel anytime.
      </EmailText>

      <EmailButton href={upgradeUrl}>Start Free Trial</EmailButton>

      <EmailText size="14px" color="muted">
        We'll be here when you're ready,
        <br />
        Hypro
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
