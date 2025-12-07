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

interface CoachingScheduledToEndEmailProps {
  clientName?: string | null
  trainerName: string
  endDate: string
  packageName: string
}

export function CoachingScheduledToEndEmail({
  clientName,
  trainerName,
  endDate,
  packageName,
}: CoachingScheduledToEndEmailProps) {
  return (
    <EmailWrapper
      previewText={`Your coaching with ${trainerName} is scheduled to end on ${endDate}`}
    >
      <EmailHeader brandName="Hypro" />

      <EmailContent>
        <EmailHeading as="h1">Coaching scheduled to end</EmailHeading>

        <EmailText>{clientName ? `Hi ${clientName},` : 'Hello,'}</EmailText>

        <EmailText>
          <strong>{trainerName}</strong> has scheduled your{' '}
          <strong>{packageName}</strong> subscription to end.
        </EmailText>

        <EmailCard>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '8px',
              }}
            >
              Your coaching will end on
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#18181b',
              }}
            >
              {endDate}
            </div>
          </div>
        </EmailCard>

        <EmailText>
          You&apos;ll continue to have full access to all coaching features
          until this date. No further charges will occur after your subscription
          ends.
        </EmailText>

        <EmailText>
          If you have any questions about this change, please reach out to{' '}
          {trainerName} directly.
        </EmailText>

        <EmailButton href="https://hypro.app/fitspace/my-trainer">
          View My Coaching
        </EmailButton>

        <EmailDivider />

        <EmailText size="14px" color="muted" style={{ marginBottom: 0 }}>
          This change was made by your trainer. If you believe this was done in
          error, please contact {trainerName}.
        </EmailText>
      </EmailContent>

      <EmailFooter companyName="Hypro" />
    </EmailWrapper>
  )
}

export default CoachingScheduledToEndEmail
