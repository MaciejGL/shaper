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

interface PremiumAccessEmailProps {
  userName?: string | null
  upgradeUrl: string
}

export const PremiumAccessEmail = ({
  userName,
  upgradeUrl,
}: PremiumAccessEmailProps) => (
  <EmailWrapper previewText="Unlock premium features - your access link is here">
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Hi ${userName}` : 'Unlock Premium Features'}
      </EmailHeading>

      <EmailText>
        You requested access to premium features. Click the button below to view
        subscription options and unlock the full Hypro experience.
      </EmailText>

      <EmailCard>
        <EmailText
          size="14px"
          weight="600"
          style={{ marginBottom: '12px', color: '#18181b' }}
        >
          Premium includes:
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Premium training plans designed by experts
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Complete exercise library with videos
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Advanced analytics and progress tracking
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '0' }}>
          • Try free for 7 days
        </EmailText>
      </EmailCard>

      <EmailButton href={upgradeUrl}>View Premium Options</EmailButton>

      <EmailText size="14px" color="muted">
        If you didn't request this link, you can safely ignore this email.
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
