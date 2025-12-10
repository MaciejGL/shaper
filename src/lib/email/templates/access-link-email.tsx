import {
  EmailButton,
  EmailContent,
  EmailFooter,
  EmailHeader,
  EmailHeading,
  EmailText,
  EmailWrapper,
} from './components'

interface AccessLinkEmailProps {
  userName?: string | null
  accessUrl: string
  isSubscriber: boolean
}

export const AccessLinkEmail = ({
  userName,
  accessUrl,
  isSubscriber,
}: AccessLinkEmailProps) => (
  <EmailWrapper previewText="Your secure link to the Hypertro Account Dashboard">
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Hi ${userName}` : 'Your Hypertro account link'}
      </EmailHeading>

      <EmailText>
        Here's your secure link to the Hypertro Account Dashboard. From there
        you can manage your profile, security, plan details and data.
      </EmailText>

      {isSubscriber && (
        <>
          <EmailText size="14px" color="muted" style={{ marginBottom: '4px' }}>
            • View your subscription details and billing history
          </EmailText>
          <EmailText size="14px" color="muted" style={{ marginBottom: '4px' }}>
            • Update your payment method
          </EmailText>
          <EmailText size="14px" color="muted" style={{ marginBottom: '4px' }}>
            • Cancel or pause your subscription
          </EmailText>
          <EmailText size="14px" color="muted" style={{ marginBottom: '16px' }}>
            • Download invoices
          </EmailText>
        </>
      )}

      <EmailButton href={accessUrl}>Open Account Dashboard</EmailButton>

      <EmailText size="14px" color="muted">
        This secure link will log you in automatically and take you to your
        account page.
      </EmailText>

      <EmailText size="14px" color="muted">
        If you didn't request this link, you can safely ignore this email.
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
