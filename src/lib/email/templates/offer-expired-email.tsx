import {
  EmailAlert,
  EmailCard,
  EmailContent,
  EmailDivider,
  EmailFooter,
  EmailHeader,
  EmailHeading,
  EmailText,
  EmailWrapper,
} from './components'

interface OfferExpiredEmailProps {
  trainerName: string
  clientEmail: string
  bundleDescription: string
  expiresAt: string
}

export const OfferExpiredEmail = ({
  trainerName,
  clientEmail,
  bundleDescription,
  expiresAt,
}: OfferExpiredEmailProps) => {
  return (
    <EmailWrapper
      previewText={`Your offer to ${clientEmail} expired without payment`}
    >
      <EmailHeader brandName="Hypro" />

      <EmailContent>
        <EmailHeading size={2} marginBottom="16px">
          Offer Expired
        </EmailHeading>

        <EmailText marginBottom="24px">Hi {trainerName},</EmailText>

        <EmailText marginBottom="24px">
          Your training offer to <strong>{clientEmail}</strong> has expired
          without payment.
        </EmailText>

        <EmailCard>
          <EmailText marginBottom="8px" size={5} color="primary" weight={600}>
            Package: {bundleDescription}
          </EmailText>
          <EmailText marginBottom="0" size={5} color="primary">
            Expired: {expiresAt}
          </EmailText>
        </EmailCard>

        <EmailAlert type="info">
          The client did not complete the checkout within the offer validity
          period. You can create a new offer if they're still interested.
        </EmailAlert>

        <EmailDivider />

        <EmailText marginBottom="16px" size={5} weight={600}>
          Next Steps:
        </EmailText>
        <EmailText marginBottom="16px" color="muted" size={5}>
          • Follow up with {clientEmail} to see if they're still interested
          <br />
          • Create a new offer if needed
          <br />• Consider extending the offer validity period for busy clients
        </EmailText>

        <EmailText color="muted" size={5} marginBottom="0">
          This is an automatic notification. No action is required unless you
          want to follow up with the client.
        </EmailText>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}
