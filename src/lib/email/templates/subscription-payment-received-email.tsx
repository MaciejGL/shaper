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
        <EmailHeading size={2} marginBottom="16px">
          🔄 Subscription Payment Received
        </EmailHeading>

        <EmailText marginBottom="24px">Hi {trainerName},</EmailText>

        <EmailText marginBottom="24px">
          <strong>{clientName}</strong> ({clientEmail}) has successfully renewed
          their coaching subscription.
        </EmailText>

        <EmailCard>
          <EmailText marginBottom="12px" size={5} color="primary" weight={600}>
            Subscription Details
          </EmailText>
          <EmailText marginBottom="8px" size={5} color="primary">
            <strong>Plan:</strong> {subscriptionType}
          </EmailText>
          <EmailText marginBottom="8px" size={5} color="primary">
            <strong>Amount:</strong> {amount} {currency.toUpperCase()}
          </EmailText>
          <EmailText marginBottom="8px" size={5} color="primary">
            <strong>Billing:</strong>{' '}
            {billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}
          </EmailText>
          <EmailText marginBottom="0" size={5} color="primary">
            <strong>Next Billing:</strong> {nextBillingDate}
          </EmailText>
        </EmailCard>

        <EmailButton href={clientProfileUrl}>View Client Profile</EmailButton>

        <EmailDivider />

        <EmailText color="muted" size={5} marginBottom="8px">
          <strong>What happens next?</strong>
        </EmailText>
        <EmailText color="muted" size={5} marginBottom="4px">
          • Funds will be transferred to your connected Stripe account according
          to your payout schedule
        </EmailText>
        <EmailText color="muted" size={5} marginBottom="4px">
          • The subscription will automatically renew on the next billing date
        </EmailText>
        <EmailText color="muted" size={5} marginBottom="4px">
          • You can view full subscription details in your Stripe Dashboard
        </EmailText>
        <EmailText color="muted" size={5} marginBottom="0">
          • Continue providing great coaching to keep your client engaged
        </EmailText>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}
