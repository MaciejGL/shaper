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

interface TrialReminderEmailProps {
  userName?: string | null
  upgradeUrl: string
}

export const TrialReminderEmail = ({
  userName,
  upgradeUrl,
}: TrialReminderEmailProps) => (
  <EmailWrapper previewText="Your free trial is waiting - try Premium for 7 days">
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName
          ? `${userName}, your free trial is waiting`
          : 'Your free trial is waiting'}
      </EmailHeading>

      <EmailText>
        You joined Hypro a few days ago but haven't tried Premium yet. Start
        your free 7-day trial today and unlock the full experience.
      </EmailText>

      <EmailCard>
        <EmailText
          size="14px"
          weight="600"
          style={{ marginBottom: '12px', color: '#18181b' }}
        >
          What you're missing:
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Premium training plans designed by experts
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Complete exercise library with HD videos
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Advanced analytics to track your progress
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '0' }}>
          • No charge for 7 days - cancel anytime
        </EmailText>
      </EmailCard>

      <EmailButton href={upgradeUrl}>Start Free Trial</EmailButton>

      <EmailText size="14px" color="muted">
        Not interested? No worries - you can continue using Hypro with basic
        features.
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
