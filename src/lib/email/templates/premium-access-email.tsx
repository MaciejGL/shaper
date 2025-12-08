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
  <EmailWrapper previewText="How to unlock premium features in Hypro">
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Hi ${userName}!` : 'Unlock Premium Features'}
      </EmailHeading>

      <EmailText>
        You requested information about upgrading your Hypro account. Premium
        subscriptions are managed through our website.
      </EmailText>

      <EmailText weight="600">How to upgrade:</EmailText>
      <EmailText>
        Click the button below to open the subscription page where you can
        choose your plan and complete the upgrade.
      </EmailText>

      <EmailButton href={upgradeUrl}>Go to Subscription Page</EmailButton>

      <EmailCard>
        <EmailText
          size="14px"
          weight="600"
          style={{ marginBottom: '12px', color: '#18181b' }}
        >
          With full access, you'll be able to:
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Use complete training plans built for your goals
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Track body measurements and see changes over time
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Store progress photos in one secure place
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Browse the full exercise library with clear instructions
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Get automatic PR detection on your key lifts
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • See muscle volume per muscle group with smart recommendations
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Use a freeze period on annual plans when life gets in the way
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Get priority on personal trainer waitlists
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '0' }}>
          • Start with a 7-day trial to test everything first
        </EmailText>
      </EmailCard>

      <EmailText size="14px" color="muted">
        If you didn't request this, you can safely ignore this email.
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
