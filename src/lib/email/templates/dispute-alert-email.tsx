import {
  EmailAlert,
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

interface DisputeAlertEmailProps {
  adminName: string | null
  disputeId: string
  chargeId: string
  amount: string
  currency: string
  reason: string
  evidenceDueBy: string
  trainerName?: string
  clientName?: string
  stripeDashboardUrl: string
}

export const DisputeAlertEmail = ({
  adminName,
  disputeId,
  amount,
  currency,
  reason,
  evidenceDueBy,
  trainerName,
  clientName,
  stripeDashboardUrl,
}: DisputeAlertEmailProps) => {
  return (
    <EmailWrapper
      previewText={`URGENT: Payment Dispute - ${amount} ${currency} (Evidence due: ${evidenceDueBy})`}
    >
      <EmailHeader brandName="Hypro" backgroundColor="#7f1d1d" />

      <EmailContent>
        <EmailHeading size={2} marginBottom="16px">
          🚨 URGENT: Payment Dispute
        </EmailHeading>

        <EmailText marginBottom="24px">
          {adminName ? `Hi ${adminName}` : 'Hi Admin'},
        </EmailText>

        <EmailAlert type="error">
          ⚠️ <strong>A client has disputed a payment.</strong> Immediate action
          required to respond before the deadline.
        </EmailAlert>

        <EmailText marginBottom="24px">
          A payment dispute has been filed and requires your attention in the
          Stripe Dashboard.
        </EmailText>

        <EmailCard>
          <EmailText marginBottom="8px" size={5} color="primary" weight={600}>
            Dispute ID: {disputeId}
          </EmailText>
          <EmailText marginBottom="8px" size={5} color="primary">
            Amount: {amount} {currency}
          </EmailText>
          <EmailText marginBottom="8px" size={5} color="primary">
            Reason: {reason}
          </EmailText>
          <EmailText marginBottom="8px" size={5} weight={600} color="primary">
            Evidence Due: {evidenceDueBy}
          </EmailText>
          {trainerName && (
            <EmailText marginBottom="8px" size={5} color="primary">
              Trainer: {trainerName}
            </EmailText>
          )}
          {clientName && (
            <EmailText marginBottom="0" size={5} color="primary">
              Client: {clientName}
            </EmailText>
          )}
        </EmailCard>

        <EmailButton href={stripeDashboardUrl}>
          Respond to Dispute in Stripe
        </EmailButton>

        <EmailDivider />

        <EmailText marginBottom="16px" size={5} weight={600}>
          Next Steps:
        </EmailText>
        <EmailText marginBottom="16px" color="muted" size={5}>
          1. Click the button above to view the dispute in Stripe
          <br />
          2. Review the client's claim and gather evidence
          <br />
          3. Submit your response before the deadline
          <br />
          4. Monitor the dispute status in Stripe Dashboard
        </EmailText>

        <EmailAlert type="warning">
          ⏰ <strong>Time-sensitive:</strong> If you don't respond by{' '}
          {evidenceDueBy}, you may automatically lose the dispute and the funds
          will be returned to the customer.
        </EmailAlert>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}
