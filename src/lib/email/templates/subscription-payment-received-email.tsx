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

export interface SubscriptionPaymentReceivedEmailProps {
  trainerName: string
  clientName: string
  clientEmail: string
  subscriptionType: string
  amount: string
  currency: string
  billingPeriod: 'monthly' | 'yearly'
  nextBillingDate: string
  clientProfileUrl: string
}

export const SubscriptionPaymentReceivedEmail = ({
  trainerName,
  clientName,
  clientEmail,
  subscriptionType,
  amount,
  currency,
  billingPeriod,
  nextBillingDate,
  clientProfileUrl,
}: SubscriptionPaymentReceivedEmailProps) => {
  return (
    <EmailWrapper
      previewText={`Subscription payment received from ${clientName} - ${amount} ${currency.toUpperCase()}`}
    >
      <EmailHeader brandName="Hypro" />

      <EmailContent>
        <EmailHeading as="h1">Subscription Payment Received</EmailHeading>

        <EmailText>Hi {trainerName},</EmailText>

        <EmailText>
          <strong>{clientName}</strong> ({clientEmail}) has successfully renewed
          their coaching subscription.
        </EmailText>

        <EmailCard>
          <EmailText style={{ marginBottom: '12px', fontWeight: '600' }}>
            Subscription Details
          </EmailText>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '16px',
            }}
          >
            <span style={{ color: '#6b7280' }}>Plan</span>
            <span style={{ fontWeight: '600' }}>{subscriptionType}</span>
          </div>
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
              {amount} {currency.toUpperCase()}
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
            <span style={{ color: '#6b7280' }}>Billing</span>
            <span style={{ fontWeight: '600' }}>
              {billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}
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
            <span style={{ color: '#6b7280' }}>Next Billing</span>
            <span style={{ fontWeight: '600' }}>{nextBillingDate}</span>
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
          • The subscription will automatically renew on the next billing date
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: '4px' }}>
          • You can view full subscription details in your Stripe Dashboard
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: 0 }}>
          • Continue providing great coaching to keep your client engaged
        </EmailText>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}
