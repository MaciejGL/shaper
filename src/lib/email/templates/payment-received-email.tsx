import {
  EmailButton,
  EmailCard,
  EmailContent,
  EmailDivider,
  EmailFooter,
  EmailHeader,
  EmailHeading,
  EmailText,
  EmailWrapper,
} from './components'

export interface PaymentReceivedEmailProps {
  trainerName: string
  clientName: string
  clientEmail: string
  packageNames: string[]
  totalAmount: string
  currency: string
  paymentType: 'one-time' | 'subscription'
  clientProfileUrl: string
}

export const PaymentReceivedEmail = ({
  trainerName,
  clientName,
  clientEmail,
  packageNames,
  totalAmount,
  currency,
  paymentType,
  clientProfileUrl,
}: PaymentReceivedEmailProps) => {
  return (
    <EmailWrapper
      previewText={`Payment received from ${clientName} - ${totalAmount} ${currency.toUpperCase()}`}
    >
      <EmailHeader brandName="Hypro" />

      <EmailContent>
        <EmailHeading as="h1">Payment Received</EmailHeading>

        <EmailText>Hi {trainerName},</EmailText>

        <EmailText>
          Great news! <strong>{clientName}</strong> ({clientEmail}) has
          successfully paid for{' '}
          {paymentType === 'subscription'
            ? 'a subscription package'
            : 'training services'}
          .
        </EmailText>

        <EmailCard>
          <EmailText style={{ marginBottom: '12px', fontWeight: '600' }}>
            Payment Details
          </EmailText>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '16px',
            }}
          >
            <span style={{ color: '#6b7280' }}>Amount</span>
            <span style={{ fontWeight: '600' }}>
              {totalAmount} {currency.toUpperCase()}
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
            <span style={{ color: '#6b7280' }}>Type</span>
            <span style={{ fontWeight: '600' }}>
              {paymentType === 'one-time' ? 'One-time Payment' : 'Subscription'}
            </span>
          </div>

          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <EmailText
              style={{
                marginBottom: '8px',
                fontSize: '14px',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Packages
            </EmailText>
            {packageNames.map((packageName, index) => (
              <div
                key={index}
                style={{ marginBottom: '4px', fontSize: '16px' }}
              >
                {packageName}
              </div>
            ))}
          </div>
        </EmailCard>

        <EmailButton href={clientProfileUrl}>View Client Profile</EmailButton>

        <EmailDivider />

        <EmailText
          color="muted"
          size="14px"
          style={{ marginBottom: '8px', fontWeight: '600' }}
        >
          What happens next?
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: '4px' }}>
          • Funds will be transferred to your connected Stripe account according
          to your payout schedule
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: '4px' }}>
          • Platform fees have been automatically deducted
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: '4px' }}>
          • You can view full transaction details in your Stripe Dashboard
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: 0 }}>
          • Service delivery tasks have been created for this purchase
        </EmailText>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}
