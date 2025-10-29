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
        <EmailHeading size={2} marginBottom="16px">
          Credit Applied from Subscription Upgrade
        </EmailHeading>

        <EmailText marginBottom="24px">
          {userName ? `Hi ${userName},` : 'Hello,'}
        </EmailText>

        <EmailText marginBottom="24px">
          Your subscription has been upgraded from{' '}
          <strong>{oldPackageName}</strong> to <strong>{newPackageName}</strong>
          .
        </EmailText>

        {/* Credit Amount Card - Prominent Display */}
        <EmailCard>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <EmailText
              size={6}
              color="muted"
              marginBottom="8px"
              style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Credit Applied
            </EmailText>
            <div
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '4px',
              }}
            >
              {creditAmount} {currency}
            </div>
            <EmailText size={5} color="muted" marginBottom="0">
              Applied on {creditDate}
            </EmailText>
          </div>
        </EmailCard>

        <EmailAlert type="success">
          <strong>Your credit is ready!</strong>
          <br />
          The unused portion of your previous subscription has been credited to
          your account and will automatically reduce your next payment.
        </EmailAlert>

        <EmailText marginBottom="16px" weight={600}>
          Next Billing Preview
        </EmailText>

        <EmailCard>
          <table
            cellPadding="0"
            cellSpacing="0"
            border={0}
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    paddingBottom: '12px',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <EmailText size={5} color="muted" marginBottom="4px">
                    Next billing date
                  </EmailText>
                  <EmailText marginBottom="0" weight={600}>
                    {nextBillingDate}
                  </EmailText>
                </td>
              </tr>
              <tr>
                <td style={{ paddingTop: '12px', paddingBottom: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <EmailText marginBottom="0">{newPackageName}</EmailText>
                    <EmailText marginBottom="0">
                      {newPlanPrice} {currency}
                    </EmailText>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <EmailText marginBottom="0" color="success">
                      Credit applied
                    </EmailText>
                    <EmailText marginBottom="0" color="success">
                      -{creditAmount} {currency}
                    </EmailText>
                  </div>
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    paddingTop: '12px',
                    borderTop: '2px solid #0f172a',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <EmailText marginBottom="0" weight={600} size={4}>
                      Amount you'll pay
                    </EmailText>
                    <EmailText marginBottom="0" weight={700} size={3}>
                      {amountAfterCredit} {currency}
                    </EmailText>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </EmailCard>

        <EmailText marginBottom="24px">
          This credit will be automatically applied to your next billing cycle.
          No action is required from you.
        </EmailText>

        <EmailDivider />

        <EmailText color="muted" size={5} marginBottom="0">
          Questions about your subscription or credit? Contact our support team
          at{' '}
          <a
            href="mailto:support@hypro.app"
            style={{ color: '#0f172a', textDecoration: 'underline' }}
          >
            support@hypro.app
          </a>
        </EmailText>
      </EmailContent>

      <EmailFooter />
    </EmailWrapper>
  )
}

