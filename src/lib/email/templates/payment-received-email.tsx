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
        <EmailHeading size={2} marginBottom="16px">
          💰 Payment Received
        </EmailHeading>

        <EmailText marginBottom="24px">Hi {trainerName},</EmailText>

        <EmailText marginBottom="24px">
          Great news! <strong>{clientName}</strong> ({clientEmail}) has
          successfully paid for{' '}
          {paymentType === 'subscription'
            ? 'a subscription package'
            : 'training services'}
          .
        </EmailText>

        <EmailCard>
          <EmailText marginBottom="12px" size={5} color="primary" weight={600}>
            Payment Details
          </EmailText>
          <EmailText marginBottom="8px" size={5} color="primary">
            <strong>Amount:</strong> {totalAmount} {currency.toUpperCase()}
          </EmailText>
          <EmailText marginBottom="8px" size={5} color="primary">
            <strong>Type:</strong>{' '}
            {paymentType === 'one-time' ? 'One-time Payment' : 'Subscription'}
          </EmailText>
          <EmailText marginBottom="12px" size={5} color="primary">
            <strong>Packages:</strong>
          </EmailText>
          {packageNames.map((packageName, index) => (
            <EmailText key={index} marginBottom="4px" size={5} color="primary">
              • {packageName}
            </EmailText>
          ))}
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
          • Platform fees have been automatically deducted
        </EmailText>
        <EmailText color="muted" size={5} marginBottom="4px">
          • You can view full transaction details in your Stripe Dashboard
        </EmailText>
        <EmailText color="muted" size={5} marginBottom="0">
          • Service delivery tasks have been created for this purchase
        </EmailText>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}
