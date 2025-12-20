import {
  EmailAlert,
  EmailButton,
  EmailCard,
  EmailContent,
  EmailDivider,
  EmailFooter,
  EmailHeader,
  EmailHeading,
  EmailLink,
  EmailText,
  EmailWrapper,
} from './components'

// Trial Ending Email
interface TrialEndingEmailProps {
  userName?: string | null
  daysRemaining: number
  packageName: string
  upgradeUrl: string
}

export function TrialEndingEmail({
  userName,
  daysRemaining,
  packageName,
  upgradeUrl,
}: TrialEndingEmailProps) {
  const dayText = daysRemaining === 1 ? 'day' : 'days'

  return (
    <EmailWrapper
      previewText={`Your ${packageName} trial ends in ${daysRemaining} ${dayText}`}
    >
      <EmailHeader brandName="Hypro" />
      <EmailContent>
        <EmailHeading as="h1">Your trial is ending soon</EmailHeading>

        <EmailText>{userName ? `Hi ${userName},` : 'Hello,'}</EmailText>

        <EmailAlert>
          Your <strong>{packageName}</strong> trial will end in{' '}
          <strong>
            {daysRemaining} {dayText}
          </strong>
        </EmailAlert>

        <EmailText>
          Don't lose access to your premium features. Continue your fitness
          journey with unlimited access to:
        </EmailText>

        <EmailCard>
          <table
            role="presentation"
            cellPadding={0}
            cellSpacing={0}
            border={0}
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    width: '20px',
                    paddingRight: '12px',
                    verticalAlign: 'top',
                    color: '#16a34a',
                    fontWeight: 'bold',
                    lineHeight: '20px',
                  }}
                >
                  ✓
                </td>
                <td style={{ paddingBottom: '12px', lineHeight: '20px' }}>
                  Unlimited training plans
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: '20px',
                    paddingRight: '12px',
                    verticalAlign: 'top',
                    color: '#16a34a',
                    fontWeight: 'bold',
                    lineHeight: '20px',
                  }}
                >
                  ✓
                </td>
                <td style={{ paddingBottom: '12px', lineHeight: '20px' }}>
                  Premium training plans library
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: '20px',
                    paddingRight: '12px',
                    verticalAlign: 'top',
                    color: '#16a34a',
                    fontWeight: 'bold',
                    lineHeight: '20px',
                  }}
                >
                  ✓
                </td>
                <td style={{ paddingBottom: '12px', lineHeight: '20px' }}>
                  Advanced tracking and logging
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: '20px',
                    paddingRight: '12px',
                    verticalAlign: 'top',
                    color: '#16a34a',
                    fontWeight: 'bold',
                    lineHeight: '20px',
                  }}
                >
                  ✓
                </td>
                <td style={{ lineHeight: '20px' }}>
                  Exercise videos and instructions
                </td>
              </tr>
            </tbody>
          </table>
        </EmailCard>

        <EmailButton href={upgradeUrl}>Continue with {packageName}</EmailButton>

        <EmailDivider />

        <EmailText size="14px" color="muted" style={{ marginBottom: 0 }}>
          If you have any questions contact us at{' '}
          <EmailLink href="mailto:support@hypro.app">
            support@hypro.app
          </EmailLink>
        </EmailText>
      </EmailContent>
      <EmailFooter companyName="Hypro" />
    </EmailWrapper>
  )
}

// Payment Failed Email
interface PaymentFailedEmailProps {
  userName?: string | null
  gracePeriodDays: number
  packageName: string
  updatePaymentUrl: string
}

export function PaymentFailedEmail({
  userName,
  gracePeriodDays,
  packageName,
  updatePaymentUrl,
}: PaymentFailedEmailProps) {
  return (
    <EmailWrapper
      previewText={`Payment issue with your ${packageName} subscription`}
    >
      <EmailHeader brandName="Hypro" />
      <EmailContent>
        <EmailHeading as="h1">Payment unsuccessful</EmailHeading>

        <EmailText>{userName ? `Hi ${userName},` : 'Hello,'}</EmailText>

        <EmailText>
          We encountered an issue processing the payment for your{' '}
          <strong>{packageName}</strong> subscription.
        </EmailText>

        <EmailAlert>
          You have {gracePeriodDays} days to update your payment method and
          maintain uninterrupted access to your premium features.
        </EmailAlert>

        <EmailText>Common reasons for payment issues:</EmailText>

        <EmailCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>• Expired credit or debit card</div>
            <div>• Insufficient account balance</div>
            <div>• Card issuer security restrictions</div>
            <div>• Billing address verification mismatch</div>
          </div>
        </EmailCard>

        <EmailButton href={updatePaymentUrl}>Update Payment Method</EmailButton>

        <EmailDivider />

        <EmailText size="14px" color="muted" style={{ marginBottom: 0 }}>
          If you have any questions contact us at{' '}
          <EmailLink href="mailto:support@hypro.app">
            support@hypro.app
          </EmailLink>
        </EmailText>
      </EmailContent>
      <EmailFooter companyName="Hypro" />
    </EmailWrapper>
  )
}

// Subscription Cancelled Email
interface SubscriptionCancelledEmailProps {
  userName?: string | null
  packageName: string
  endDate: string
  reactivateUrl: string
}

export function SubscriptionCancelledEmail({
  userName,
  packageName,
  endDate,
  reactivateUrl,
}: SubscriptionCancelledEmailProps) {
  return (
    <EmailWrapper
      previewText={`Your ${packageName} subscription has been cancelled`}
    >
      <EmailHeader brandName="Hypro" />
      <EmailContent>
        <EmailHeading as="h1">Subscription cancelled</EmailHeading>

        <EmailText>{userName ? `Hi ${userName},` : 'Hello,'}</EmailText>

        <EmailText>
          We've successfully cancelled your <strong>{packageName}</strong>{' '}
          subscription as requested.
        </EmailText>

        <EmailAlert>
          You'll continue to have full access to all premium features until{' '}
          <strong>{endDate}</strong>
        </EmailAlert>

        <EmailText>
          Changed your mind? You can easily reactivate your subscription anytime
          before it expires.
        </EmailText>

        <EmailButton href={reactivateUrl}>Reactivate Subscription</EmailButton>

        <EmailDivider />

        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          We're sorry to see you go. Your feedback helps us improve - we'd love
          to hear about your experience.
        </EmailText>

        <EmailText size="14px" color="muted" style={{ marginBottom: 0 }}>
          If you have any questions contact us at{' '}
          <EmailLink href="mailto:support@hypro.app">
            support@hypro.app
          </EmailLink>
        </EmailText>
      </EmailContent>
      <EmailFooter companyName="Hypro" />
    </EmailWrapper>
  )
}

// Subscription Deleted Email
interface SubscriptionDeletedEmailProps {
  userName?: string | null
  packageName: string
}

export function SubscriptionDeletedEmail({
  userName,
  packageName,
}: SubscriptionDeletedEmailProps) {
  return (
    <EmailWrapper previewText={`Your ${packageName} subscription has ended`}>
      <EmailHeader brandName="Hypro" />
      <EmailContent>
        <EmailHeading as="h1">Subscription ended</EmailHeading>

        <EmailText>{userName ? `Hi ${userName},` : 'Hello,'}</EmailText>

        <EmailText>
          Your <strong>{packageName}</strong> subscription has ended and has
          been removed from your account.
        </EmailText>

        <EmailText>
          You can still access your basic Hypro account and create a new
          subscription anytime to regain access to premium features.
        </EmailText>

        <EmailDivider />

        <EmailText size="14px" color="muted" style={{ marginBottom: '8px' }}>
          We're sorry to see you go. Your feedback is valuable to us - we'd love
          to hear about your experience.
        </EmailText>

        <EmailText size="14px" color="muted" style={{ marginBottom: 0 }}>
          If you have any questions contact us at{' '}
          <EmailLink href="mailto:support@hypro.app">
            support@hypro.app
          </EmailLink>
        </EmailText>
      </EmailContent>
      <EmailFooter companyName="Hypro" />
    </EmailWrapper>
  )
}

// Welcome/Reactivation Email
interface WelcomeEmailProps {
  userName?: string | null
  packageName: string
  isReactivation?: boolean
  dashboardUrl: string
}

export function WelcomeEmail({
  userName,
  packageName,
  isReactivation = false,
  dashboardUrl,
}: WelcomeEmailProps) {
  const greeting = isReactivation ? 'Welcome back!' : 'Welcome to Premium!'
  const message = isReactivation
    ? `Welcome back! Your ${packageName} subscription has been reactivated and you now have full access to all premium features.`
    : `Thank you for subscribing to ${packageName}! Your premium access is now active and ready to take your fitness journey to the next level.`

  return (
    <EmailWrapper
      previewText={
        isReactivation
          ? `Your ${packageName} subscription is reactivated`
          : `Welcome to ${packageName}!`
      }
    >
      <EmailHeader brandName="Hypro" />
      <EmailContent>
        <EmailHeading as="h1">{greeting}</EmailHeading>

        <EmailText>{userName ? `Hi ${userName},` : 'Hello,'}</EmailText>

        <EmailText>{message}</EmailText>

        <EmailText>Your premium membership includes:</EmailText>

        <EmailCard>
          <table
            role="presentation"
            cellPadding={0}
            cellSpacing={0}
            border={0}
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    width: '20px',
                    paddingRight: '12px',
                    verticalAlign: 'top',
                    color: '#16a34a',
                    fontWeight: 'bold',
                    lineHeight: '20px',
                  }}
                >
                  ✓
                </td>
                <td style={{ paddingBottom: '12px', lineHeight: '20px' }}>
                  Unlimited training plans
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: '20px',
                    paddingRight: '12px',
                    verticalAlign: 'top',
                    color: '#16a34a',
                    fontWeight: 'bold',
                    lineHeight: '20px',
                  }}
                >
                  ✓
                </td>
                <td style={{ paddingBottom: '12px', lineHeight: '20px' }}>
                  Premium training plans library
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: '20px',
                    paddingRight: '12px',
                    verticalAlign: 'top',
                    color: '#16a34a',
                    fontWeight: 'bold',
                    lineHeight: '20px',
                  }}
                >
                  ✓
                </td>
                <td style={{ paddingBottom: '12px', lineHeight: '20px' }}>
                  Advanced tracking and logging
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: '20px',
                    paddingRight: '12px',
                    verticalAlign: 'top',
                    color: '#16a34a',
                    fontWeight: 'bold',
                    lineHeight: '20px',
                  }}
                >
                  ✓
                </td>
                <td style={{ lineHeight: '20px' }}>
                  Exercise videos and instructions
                </td>
              </tr>
            </tbody>
          </table>
        </EmailCard>

        <EmailButton href={dashboardUrl}>Start Training Now</EmailButton>

        <EmailDivider />

        <EmailText size="14px" color="muted" style={{ marginBottom: 0 }}>
          If you have any questions contact us at{' '}
          <EmailLink href="mailto:support@hypro.app">
            support@hypro.app
          </EmailLink>
        </EmailText>
      </EmailContent>
      <EmailFooter companyName="Hypro" />
    </EmailWrapper>
  )
}

// Grace Period Ending Email
interface GracePeriodEndingEmailProps {
  userName?: string | null
  packageName: string
  daysRemaining: number
  updatePaymentUrl: string
}

export function GracePeriodEndingEmail({
  userName,
  packageName,
  daysRemaining,
  updatePaymentUrl,
}: GracePeriodEndingEmailProps) {
  const dayText = daysRemaining === 1 ? 'day' : 'days'

  return (
    <EmailWrapper
      previewText={`Final notice: ${packageName} subscription ending in ${daysRemaining} ${dayText}`}
    >
      <EmailHeader brandName="Hypro" />
      <EmailContent>
        <EmailHeading as="h1">Final notice: Action required</EmailHeading>

        <EmailText>{userName ? `Hi ${userName},` : 'Hello,'}</EmailText>

        <EmailAlert>
          <strong>
            Your {packageName} subscription will be cancelled in {daysRemaining}{' '}
            {dayText}
          </strong>{' '}
          due to payment issues.
        </EmailAlert>

        <EmailText>
          This is your final reminder to update your payment method and maintain
          your premium access.
        </EmailText>

        <EmailText>
          After {daysRemaining} {dayText}, you'll lose access to all premium
          features including:
        </EmailText>

        <EmailCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>• Unlimited workout plans</div>
            <div>• Progress tracking tools</div>
            <div>• Premium exercise library</div>
          </div>
        </EmailCard>

        <EmailButton href={updatePaymentUrl}>
          Update Payment Method Now
        </EmailButton>

        <EmailDivider />

        <EmailText size="14px" color="muted" style={{ marginBottom: 0 }}>
          If you have any questions contact us at{' '}
          <EmailLink href="mailto:support@hypro.app">
            support@hypro.app
          </EmailLink>
        </EmailText>
      </EmailContent>
      <EmailFooter companyName="Hypro" />
    </EmailWrapper>
  )
}
