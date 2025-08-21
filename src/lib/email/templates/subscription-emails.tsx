import {
  EmailButton,
  EmailContent,
  EmailHeader,
  EmailHeading,
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
  return (
    <EmailWrapper>
      <EmailHeader brandName="Hypertro" />
      <EmailContent>
        <EmailHeading size={2}>Your trial is ending soon</EmailHeading>

        <p>Hi{userName ? ` ${userName}` : ''},</p>

        <p>
          Your {packageName} trial will end in{' '}
          <strong>
            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
          </strong>
          .
        </p>

        <p>
          Don't lose access to your premium features! Upgrade now to continue
          enjoying:
        </p>

        <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
          <li>Unlimited workout plans</li>
          <li>Advanced progress tracking</li>
          <li>Premium exercise library</li>
          <li>Meal planning tools</li>
        </ul>

        <div style={{ margin: '24px 0' }}>
          <EmailButton href={upgradeUrl}>Upgrade Now</EmailButton>
        </div>

        <p style={{ fontSize: '14px', color: '#666', marginTop: '24px' }}>
          Questions? Reply to this email or contact our support team.
        </p>
      </EmailContent>
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
    <EmailWrapper>
      <EmailHeader brandName="Hypertro" />
      <EmailContent>
        <EmailHeading size={2}>Payment Failed - Action Required</EmailHeading>

        <p>Hi{userName ? ` ${userName}` : ''},</p>

        <p>
          We were unable to process the payment for your {packageName}{' '}
          subscription.
        </p>

        <p>
          <strong>Don't worry!</strong> You have {gracePeriodDays} days to
          update your payment method and keep your premium access active.
        </p>

        <p>Common reasons for payment failures:</p>

        <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
          <li>Expired credit card</li>
          <li>Insufficient funds</li>
          <li>Card issuer declined the transaction</li>
          <li>Billing address mismatch</li>
        </ul>

        <div style={{ margin: '24px 0' }}>
          <EmailButton href={updatePaymentUrl}>
            Update Payment Method
          </EmailButton>
        </div>

        <p style={{ fontSize: '14px', color: '#666', marginTop: '24px' }}>
          Need help? Contact us at support@hypertro.app
        </p>
      </EmailContent>
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
    <EmailWrapper>
      <EmailHeader brandName="Hypertro" />
      <EmailContent>
        <EmailHeading size={2}>Subscription Cancelled</EmailHeading>

        <p>Hi{userName ? ` ${userName}` : ''},</p>

        <p>Your {packageName} subscription has been cancelled as requested.</p>

        <p>
          You'll continue to have access to premium features until{' '}
          <strong>{endDate}</strong>.
        </p>

        <p>
          Changed your mind? You can reactivate your subscription anytime before
          it expires.
        </p>

        <div style={{ margin: '24px 0' }}>
          <EmailButton href={reactivateUrl}>
            Reactivate Subscription
          </EmailButton>
        </div>

        <p style={{ fontSize: '14px', color: '#666', marginTop: '24px' }}>
          We're sorry to see you go. If you have feedback about your experience,
          we'd love to hear from you - just reply to this email.
        </p>
      </EmailContent>
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
  return (
    <EmailWrapper>
      <EmailHeader brandName="Hypertro" />
      <EmailContent>
        <EmailHeading size={2}>
          {isReactivation ? 'Welcome back!' : 'Welcome to Premium!'}
        </EmailHeading>

        <p>Hi{userName ? ` ${userName}` : ''},</p>

        <p>
          {isReactivation
            ? `Welcome back! Your ${packageName} subscription has been reactivated.`
            : `Thank you for subscribing to ${packageName}! Your premium access is now active.`}
        </p>

        <p>You now have access to:</p>

        <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
          <li>Unlimited workout plans</li>
          <li>Advanced progress tracking</li>
          <li>Premium exercise library</li>
          <li>Meal planning tools</li>
          <li>Priority support</li>
        </ul>

        <div style={{ margin: '24px 0' }}>
          <EmailButton href={dashboardUrl}>Access Your Dashboard</EmailButton>
        </div>

        <p style={{ fontSize: '14px', color: '#666', marginTop: '24px' }}>
          Questions? We're here to help at support@hypertro.app
        </p>
      </EmailContent>
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
  return (
    <EmailWrapper>
      <EmailHeader brandName="Hypertro" />
      <EmailContent>
        <EmailHeading size={2}>
          Final Notice - Update Payment Method
        </EmailHeading>

        <p>Hi{userName ? ` ${userName}` : ''},</p>

        <p>
          <strong>
            Your {packageName} subscription will be cancelled in {daysRemaining}{' '}
            day{daysRemaining !== 1 ? 's' : ''}
          </strong>
          due to payment issues.
        </p>

        <p>
          This is your final reminder to update your payment method and keep
          your premium access.
        </p>

        <p
          style={{
            background: '#fff3cd',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #ffeaa7',
          }}
        >
          ⚠️ After {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}, you'll
          lose access to all premium features.
        </p>

        <div style={{ margin: '24px 0' }}>
          <EmailButton href={updatePaymentUrl}>
            Update Payment Method Now
          </EmailButton>
        </div>

        <p style={{ fontSize: '14px', color: '#666', marginTop: '24px' }}>
          Need assistance? Contact us immediately at support@hypertro.app
        </p>
      </EmailContent>
    </EmailWrapper>
  )
}
