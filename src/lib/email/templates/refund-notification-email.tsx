import {
  EmailAlert,
  EmailCard,
  EmailContent,
  EmailFooter,
  EmailHeader,
  EmailHeading,
  EmailText,
  EmailWrapper,
} from './components'

interface RefundNotificationEmailProps {
  trainerName: string
  clientName: string
  packageName: string
  refundAmount: string
  currency: string
  refundReason: string
}

export const RefundNotificationEmail = ({
  trainerName,
  clientName,
  packageName,
  refundAmount,
  currency,
  refundReason,
}: RefundNotificationEmailProps) => {
  return (
    <EmailWrapper
      previewText={`Refund processed for ${clientName} - ${packageName}`}
    >
      <EmailHeader brandName="Hypro" />

      <EmailContent>
        <EmailHeading as="h1">Refund Processed</EmailHeading>

        <EmailText>Hi {trainerName},</EmailText>

        <EmailText>
          A refund has been processed for a payment from your client{' '}
          <strong>{clientName}</strong>.
        </EmailText>

        <EmailCard>
          <EmailText style={{ marginBottom: '12px', fontWeight: '600' }}>
            Refund Details
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
            <span style={{ fontWeight: '600' }}>{packageName}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '16px',
            }}
          >
            <span style={{ color: '#6b7280' }}>Refund Amount</span>
            <span style={{ fontWeight: '600' }}>
              {refundAmount} {currency}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '16px',
            }}
          >
            <span style={{ color: '#6b7280' }}>Reason</span>
            <span style={{ fontWeight: '600' }}>{refundReason}</span>
          </div>
        </EmailCard>

        <EmailAlert>
          <strong>What happens next?</strong>
          <br />• The refund amount has been deducted from your balance
          <br />• Stripe will automatically adjust your payout
          <br />• You can view details in your Stripe Dashboard
        </EmailAlert>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}
