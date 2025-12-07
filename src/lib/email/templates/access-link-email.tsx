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
  <EmailWrapper
    previewText={
      isSubscriber
        ? 'Manage your subscription and billing'
        : 'Access your account and subscription options'
    }
  >
    <EmailHeader brandName="Hypro" />
    <EmailContent>
      <EmailHeading as="h1">
        {userName ? `Hi ${userName}` : 'Your Account Access Link'}
      </EmailHeading>

      <EmailText>
        {isSubscriber
          ? 'You requested access to manage your subscription. Click the button below to view your billing details, update payment methods, or manage your plan.'
          : 'You requested access to your account. Click the button below to view subscription options and manage your account.'}
      </EmailText>

      <EmailButton href={accessUrl}>
        {isSubscriber ? 'Manage Subscription' : 'View Account'}
      </EmailButton>

      <EmailText size="14px" color="muted">
        This link will take you to your account management page where you can
        securely manage your subscription.
      </EmailText>

      <EmailText size="14px" color="muted">
        If you didn't request this link, you can safely ignore this email.
      </EmailText>
    </EmailContent>
    <EmailFooter companyName="Hypro" />
  </EmailWrapper>
)
