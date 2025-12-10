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
  <EmailWrapper previewText="How's your first week going?">
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Hey ${userName}!` : 'Your first week with Hypro'}
      </EmailHeading>

      <EmailText>
        How's training going? Just checking in after your first few days with
        Hypro.
      </EmailText>

      <EmailText>
        If you want to take your tracking to the next level, full access gives
        you:
      </EmailText>

      <EmailCard>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • See exactly which muscles you're hitting (and which need more work)
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Track body changes with secure progress photos
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          • Get notified when you hit new PRs
        </EmailText>
        <EmailText size="14px" color="muted" style={{ marginBottom: '0' }}>
          • Follow premium training plans designed by coaches
        </EmailText>
      </EmailCard>

      <EmailText weight="600">
        Your first 7 days of full access are free to try.
      </EmailText>

      <EmailButton href={upgradeUrl}>Start 7-Day Free Trial</EmailButton>

      <EmailText size="14px" color="muted">
        No pressure - the free version works great for basic training. But if
        you want the full picture of your progress, we're here.
      </EmailText>

      <EmailText size="14px" color="muted">
        Happy training,
        <br />
        Hypro
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
