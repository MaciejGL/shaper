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
  <EmailWrapper previewText="Welcome to Hypro - Start your fitness journey today">
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Welcome to Hypro, ${userName}!` : 'Welcome to Hypro!'}
      </EmailHeading>

      <EmailText>
        Thanks for joining Hypro. We're excited to help you achieve your fitness
        goals with smart training tools and expert-designed programs.
      </EmailText>

      <EmailCard>
        <EmailText
          size="14px"
          weight="600"
          style={{ marginBottom: '12px', color: '#18181b' }}
        >
          Get started with Premium:
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Access premium training plans
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Complete exercise library with videos
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Advanced analytics and progress tracking
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '0' }}>
          • Try free for 7 days - cancel anytime
        </EmailText>
      </EmailCard>

      <EmailButton href={upgradeUrl}>Start Free Trial</EmailButton>

      <EmailText size="14px" color="muted">
        Questions? Reply to this email or contact us at support@hypro.app
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
