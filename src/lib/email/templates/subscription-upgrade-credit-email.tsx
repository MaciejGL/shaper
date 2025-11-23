import {
  EmailAlert,
  EmailCard,
  EmailContent,
  EmailFooter,
  EmailHeader,
  EmailHeading,
  EmailText,
  EmailWrapper,
} from './components'

interface SubscriptionUpgradeCreditEmailProps {
  userName?: string | null
  oldPackageName: string
  newPackageName: string
  creditAmount: string
  currency: string
  creditDate: string
  nextBillingDate: string
  newPlanPrice: string
  amountAfterCredit: string
}

export const SubscriptionUpgradeCreditEmail = ({
  userName,
  oldPackageName,
  newPackageName,
  creditAmount,
  currency,
  creditDate,
  nextBillingDate,
  newPlanPrice,
  amountAfterCredit,
}: SubscriptionUpgradeCreditEmailProps) => {
  return (
    <EmailWrapper
      previewText={`Credit applied from subscription upgrade - ${creditAmount} ${currency}`}
    >
      <EmailHeader brandName="Hypro" />

      <EmailContent>
        <EmailHeading as="h1">
          Credit Applied from Subscription Upgrade
        </EmailHeading>

        <EmailText>{userName ? `Hi ${userName},` : 'Hello,'}</EmailText>

        <EmailText>
          Your subscription has been upgraded from{' '}
          <strong>{oldPackageName}</strong> to <strong>{newPackageName}</strong>
          .
        </EmailText>

        {/* Credit Amount Card - Prominent Display */}
        <EmailCard padding="32px">
          <div style={{ textAlign: 'center' }}>
            <EmailText
              size="14px"
              color="muted"
              style={{
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Credit Applied
            </EmailText>
            <div
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#18181b',
                marginBottom: '4px',
              }}
            >
              {creditAmount} {currency}
            </div>
            <EmailText size="14px" color="muted" style={{ marginBottom: 0 }}>
              Applied on {creditDate}
            </EmailText>
          </div>
        </EmailCard>

        <EmailAlert>
          <strong>Your credit is ready!</strong> The unused portion of your
          previous subscription has been credited to your account and will
          automatically reduce your next payment.
        </EmailAlert>

        <EmailText weight="600">Next Billing Preview</EmailText>

        <EmailCard>
          <div
            style={{
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '12px',
              marginBottom: '12px',
            }}
          >
            <EmailText
              size="14px"
              color="muted"
              style={{ marginBottom: '4px' }}
            >
              Next billing date
            </EmailText>
            <EmailText style={{ marginBottom: 0, fontWeight: '600' }}>
              {nextBillingDate}
            </EmailText>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <span style={{ color: '#4b5563' }}>{newPackageName}</span>
            <span style={{ fontWeight: '600' }}>
              {newPlanPrice} {currency}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: '#16a34a',
            }}
          >
            <span>Credit applied</span>
            <span style={{ fontWeight: '600' }}>
              -{creditAmount} {currency}
            </span>
          </div>

          <div
            style={{
              borderTop: '2px solid #18181b',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: '600' }}>Amount you'll pay</span>
            <span style={{ fontWeight: '700', fontSize: '18px' }}>
              {amountAfterCredit} {currency}
            </span>
          </div>
        </EmailCard>

        <EmailText>
          This credit will be automatically applied to your next billing cycle.
          No action is required from you.
        </EmailText>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}
