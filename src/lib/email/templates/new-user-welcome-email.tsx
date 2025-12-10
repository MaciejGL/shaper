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

interface NewUserWelcomeEmailProps {
  userName?: string | null
  upgradeUrl: string
}

export const NewUserWelcomeEmail = ({
  userName,
  upgradeUrl,
}: NewUserWelcomeEmailProps) => (
  <EmailWrapper previewText="Your training companion is ready">
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Welcome to Hypro, ${userName}!` : 'Welcome to Hypro!'}
      </EmailHeading>

      <EmailText>You're all set to start training.</EmailText>

      <EmailText weight="600">With your free account, you can:</EmailText>
      <EmailText size="14px" color="muted" style={{ marginBottom: '4px' }}>
        • Browse workout plans
      </EmailText>
      <EmailText size="14px" color="muted" style={{ marginBottom: '4px' }}>
        • Track your sessions
      </EmailText>
      <EmailText size="14px" color="muted" style={{ marginBottom: '16px' }}>
        • Log exercises
      </EmailText>

      <EmailCard>
        <EmailText
          size="14px"
          weight="600"
          style={{ marginBottom: '12px', color: '#18181b' }}
        >
          Want the complete experience? Full access unlocks:
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Progress photos and body measurements
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Automatic PR detection on your lifts
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Muscle volume tracking with recommendations
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Premium training plans built for your goals
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '0' }}>
          • 7-day free trial to try everything
        </EmailText>
      </EmailCard>

      <EmailButton href={upgradeUrl}>See Full Access Options</EmailButton>

      <EmailText size="14px" color="muted">
        Train hard,
        <br />
        The Hypro Team
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
