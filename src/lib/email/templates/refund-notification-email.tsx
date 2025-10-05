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
        <EmailHeading size={2} marginBottom="16px">
          Refund Processed
        </EmailHeading>

        <EmailText marginBottom="24px">Hi {trainerName},</EmailText>

        <EmailText marginBottom="24px">
          A refund has been processed for a payment from your client{' '}
          <strong>{clientName}</strong>.
        </EmailText>

        <EmailCard>
          <EmailText marginBottom="8px" size={5} color="primary" weight={600}>
            Package: {packageName}
          </EmailText>
          <EmailText marginBottom="8px" size={5} color="primary">
            Refund Amount: {refundAmount} {currency}
          </EmailText>
          <EmailText marginBottom="0" size={5} color="primary">
            Reason: {refundReason}
          </EmailText>
        </EmailCard>

        <EmailAlert type="info">
          <strong>What happens next?</strong>
          <br />• The refund amount has been deducted from your balance
          <br />• Stripe will automatically adjust your payout
          <br />• You can view details in your Stripe Dashboard
        </EmailAlert>

        <EmailDivider />

        <EmailText color="muted" size={5} marginBottom="0">
          If you have questions about this refund, please contact our support
          team.
        </EmailText>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}
