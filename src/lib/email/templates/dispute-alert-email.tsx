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
      <EmailHeader brandName="Hypro" />

      <EmailContent>
        <EmailHeading as="h1">URGENT: Payment Dispute</EmailHeading>

        <EmailText>{adminName ? `Hi ${adminName}` : 'Hi Admin'},</EmailText>

        <EmailAlert>
          <strong>A client has disputed a payment.</strong> Immediate action
          required to respond before the deadline.
        </EmailAlert>

        <EmailText>
          A payment dispute has been filed and requires your attention in the
          Stripe Dashboard.
        </EmailText>

        <EmailCard>
          <EmailText style={{ marginBottom: '12px', fontWeight: '600' }}>
            Dispute Details
          </EmailText>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '16px',
            }}
          >
            <span style={{ color: '#6b7280' }}>Dispute ID</span>
            <span style={{ fontWeight: '600' }}>{disputeId}</span>
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
              {amount} {currency}
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
            <span style={{ fontWeight: '600' }}>{reason}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '16px',
              color: '#dc2626',
            }}
          >
            <span style={{ fontWeight: '600' }}>Evidence Due</span>
            <span style={{ fontWeight: '600' }}>{evidenceDueBy}</span>
          </div>

          {trainerName && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '16px',
              }}
            >
              <span style={{ color: '#6b7280' }}>Trainer</span>
              <span style={{ fontWeight: '600' }}>{trainerName}</span>
            </div>
          )}

          {clientName && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '16px',
              }}
            >
              <span style={{ color: '#6b7280' }}>Client</span>
              <span style={{ fontWeight: '600' }}>{clientName}</span>
            </div>
          )}
        </EmailCard>

        <EmailButton href={stripeDashboardUrl}>
          Respond to Dispute in Stripe
        </EmailButton>

        <EmailDivider />

        <EmailText style={{ marginBottom: '12px', fontWeight: '600' }}>
          Next Steps:
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: '4px' }}>
          1. Click the button above to view the dispute in Stripe
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: '4px' }}>
          2. Review the client's claim and gather evidence
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: '4px' }}>
          3. Submit your response before the deadline
        </EmailText>
        <EmailText color="muted" size="14px" style={{ marginBottom: '16px' }}>
          4. Monitor the dispute status in Stripe Dashboard
        </EmailText>

        <EmailAlert>
          <strong>Time-sensitive:</strong> If you don't respond by{' '}
          {evidenceDueBy}, you may automatically lose the dispute and the funds
          will be returned to the customer.
        </EmailAlert>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}
