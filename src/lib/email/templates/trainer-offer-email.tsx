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

interface TrainerOfferEmailProps {
  clientName?: string | null
  trainerName: string
  bundleItems: {
    quantity: number
    packageName: string
    services: string[]
  }[]
  personalMessage?: string | null
  offerUrl: string
  expiresAt: string
}

export const TrainerOfferEmail = ({
  clientName,
  trainerName,
  bundleItems,
  personalMessage,
  offerUrl,
  expiresAt,
}: TrainerOfferEmailProps) => {
  const expirationTime = new Date(expiresAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const totalPackages = bundleItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  return (
    <EmailWrapper
      previewText={`${trainerName} has created a custom training package for you`}
    >
      <EmailHeader brandName="Hypro" />

      <EmailContent>
        <EmailHeading size={2} marginBottom="12px">
          Training package offer
        </EmailHeading>

        <EmailText marginBottom="24px">
          {clientName ? `Hi ${clientName},` : 'Hello,'}
        </EmailText>

        <EmailText marginBottom="28px">
          <strong>{trainerName}</strong> has created a personalized training
          package designed specifically for your fitness goals.
        </EmailText>

        <EmailCard>
          <EmailHeading size={3} marginBottom="16px" weight={600}>
            Your Training Bundle
          </EmailHeading>

          {bundleItems.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom:
                  index < bundleItems.length - 1 ? '1px solid #e2e8f0' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '4px',
                }}
              >
                {item.quantity}x {item.packageName}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                Includes: {item.services.join(', ')}
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                color: '#475569',
                marginBottom: '4px',
              }}
            >
              <strong>Total packages:</strong> {totalPackages}
            </div>
            <div style={{ fontSize: '14px', color: '#475569' }}>
              <strong>Your trainer:</strong> {trainerName}
            </div>
          </div>
        </EmailCard>

        {personalMessage && (
          <EmailCard backgroundColor="#fefce8" borderColor="#fde047">
            <EmailText size={5} weight={600} color="primary" marginBottom="8px">
              Personal message from {trainerName}:
            </EmailText>
            <p
              style={{
                margin: '0',
                fontSize: '16px',
                fontStyle: 'italic',
                color: '#a16207',
                lineHeight: '1.6',
              }}
            >
              "{personalMessage}"
            </p>
          </EmailCard>
        )}

        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <EmailButton href={offerUrl} size="lg">
            View Training Package
          </EmailButton>
        </div>

        <EmailAlert type="warning">
          This offer expires on <strong>{expirationTime}</strong>. Training
          packages are customized specifically for your goals and fitness level.
        </EmailAlert>

        <EmailDivider />

        <EmailText size={5} color="muted" marginBottom="0">
          Questions about this offer? Contact {trainerName} directly or reach
          out to our support team at{' '}
          <a
            href="mailto:support@hypro.app"
            style={{ color: '#0f172a', textDecoration: 'underline' }}
          >
            support@hypro.app
          </a>
        </EmailText>
      </EmailContent>

      <EmailFooter
        companyName="Hypro"
        address={`This email was sent on behalf of ${trainerName}. You're receiving this because ${trainerName} created a training package offer for you.`}
      />
    </EmailWrapper>
  )
}

export default TrainerOfferEmail
