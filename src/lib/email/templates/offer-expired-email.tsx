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
        <EmailHeading as="h1">Offer Expired</EmailHeading>

        <EmailText>Hi {trainerName},</EmailText>

        <EmailText>
          Your training offer to <strong>{clientEmail}</strong> has expired
          without payment.
        </EmailText>

        <EmailCard>
          <EmailText style={{ marginBottom: '12px', fontWeight: '600' }}>
            Offer Details
          </EmailText>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '16px',
            }}
          >
            <span style={{ color: '#6b7280' }}>Package</span>
            <span style={{ fontWeight: '600' }}>{bundleDescription}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '16px',
            }}
          >
            <span style={{ color: '#6b7280' }}>Expired</span>
            <span style={{ fontWeight: '600' }}>{expiresAt}</span>
          </div>
        </EmailCard>

        <EmailAlert>
          The client did not complete the checkout within the offer validity
          period. You can create a new offer if they're still interested.
        </EmailAlert>

        <EmailDivider />

        <EmailText style={{ marginBottom: '12px', fontWeight: '600' }}>
          Next Steps:
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: '4px' }}>
          • Follow up with {clientEmail} to see if they're still interested
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: '4px' }}>
          • Create a new offer if needed
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: '16px' }}>
          • Consider extending the offer validity period for busy clients
        </EmailText>

        <EmailText color="muted" size="14px" style={{ marginBottom: 0 }}>
          This is an automatic notification.
        </EmailText>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}
