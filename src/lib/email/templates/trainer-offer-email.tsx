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
        <EmailHeading as="h1">Training package offer</EmailHeading>

        <EmailText>{clientName ? `Hi ${clientName},` : 'Hello,'}</EmailText>

        <EmailText>
          <strong>{trainerName}</strong> has created a personalized training
          package designed specifically for your fitness goals.
        </EmailText>

        <EmailCard>
          <EmailHeading as="h3">Your Training Bundle</EmailHeading>

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
                  color: '#18181b',
                  marginBottom: '4px',
                }}
              >
                {item.quantity}x {item.packageName}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Includes: {item.services.join(', ')}
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                color: '#4b5563',
                marginBottom: '4px',
              }}
            >
              <strong>Total packages:</strong> {totalPackages}
            </div>
            <div style={{ fontSize: '14px', color: '#4b5563' }}>
              <strong>Your trainer:</strong> {trainerName}
            </div>
          </div>
        </EmailCard>

        {personalMessage && (
          <EmailCard backgroundColor="#fafafa">
            <EmailText size="14px" weight="600" style={{ marginBottom: '8px' }}>
              Personal message from {trainerName}:
            </EmailText>
            <p
              style={{
                margin: '0',
                fontSize: '16px',
                fontStyle: 'italic',
                color: '#4b5563',
                lineHeight: '1.6',
              }}
            >
              "{personalMessage}"
            </p>
          </EmailCard>
        )}

        <EmailButton href={offerUrl}>View Training Package</EmailButton>

        <EmailAlert>
          This offer expires on <strong>{expirationTime}</strong>. Training
          packages are customized specifically for your goals and fitness level.
        </EmailAlert>

        <EmailDivider />

        <EmailText size="14px" color="muted" style={{ marginBottom: 0 }}>
          Questions about this offer? Contact {trainerName} directly.
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
