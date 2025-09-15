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
        <EmailHeading size={2} marginBottom="12px">
          Your trial is ending soon
        </EmailHeading>

        <EmailText marginBottom="24px">
          {userName ? `Hi ${userName},` : 'Hello,'}
        </EmailText>

        <EmailAlert type="warning">
          Your <strong>{packageName}</strong> trial will end in{' '}
          <strong>
            {daysRemaining} {dayText}
          </strong>
        </EmailAlert>

        <EmailText marginBottom="24px">
          Don't lose access to your premium features. Continue your fitness
          journey with unlimited access to:
        </EmailText>

        <EmailCard>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>✓</span>
              <span>Unlimited workout plans and programs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>✓</span>
              <span>Advanced progress tracking and analytics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>✓</span>
              <span>Complete exercise library with instructions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>✓</span>
              <span>Personalized meal planning tools</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>✓</span>
              <span>Priority customer support</span>
            </div>
          </div>
        </EmailCard>

        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <EmailButton href={upgradeUrl} size="lg">
            Continue with {packageName}
          </EmailButton>
        </div>

        <EmailDivider />

        <EmailText size={5} color="muted" marginBottom="0">
          Questions about your subscription? Contact our team at{' '}
          <a
            href="mailto:support@hypro.app"
            style={{ color: '#0f172a', textDecoration: 'underline' }}
          >
            support@hypro.app
          </a>
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
        <EmailHeading size={2} marginBottom="12px">
          Payment unsuccessful
        </EmailHeading>

        <EmailText marginBottom="24px">
          {userName ? `Hi ${userName},` : 'Hello,'}
        </EmailText>

        <EmailText marginBottom="24px">
          We encountered an issue processing the payment for your{' '}
          <strong>{packageName}</strong> subscription.
        </EmailText>

        <EmailAlert type="info">
          <strong>No worries!</strong> You have {gracePeriodDays} days to update
          your payment method and maintain uninterrupted access to your premium
          features.
        </EmailAlert>

        <EmailText marginBottom="16px">
          Common reasons for payment issues:
        </EmailText>

        <EmailCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>• Expired credit or debit card</div>
            <div>• Insufficient account balance</div>
            <div>• Card issuer security restrictions</div>
            <div>• Billing address verification mismatch</div>
            <div>• Card network connectivity issues</div>
          </div>
        </EmailCard>

        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <EmailButton href={updatePaymentUrl} size="lg">
            Update Payment Method
          </EmailButton>
        </div>

        <EmailDivider />

        <EmailText size={5} color="muted" marginBottom="0">
          Need assistance? Our support team is ready to help at{' '}
          <a
            href="mailto:support@hypro.app"
            style={{ color: '#0f172a', textDecoration: 'underline' }}
          >
            support@hypro.app
          </a>
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
        <EmailHeading size={2} marginBottom="12px">
          Subscription cancelled
        </EmailHeading>

        <EmailText marginBottom="24px">
          {userName ? `Hi ${userName},` : 'Hello,'}
        </EmailText>

        <EmailText marginBottom="24px">
          We've successfully cancelled your <strong>{packageName}</strong>{' '}
          subscription as requested.
        </EmailText>

        <EmailAlert type="info">
          You'll continue to have full access to all premium features until{' '}
          <strong>{endDate}</strong>
        </EmailAlert>

        <EmailText marginBottom="24px">
          Changed your mind? You can easily reactivate your subscription anytime
          before it expires.
        </EmailText>

        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <EmailButton href={reactivateUrl} size="lg">
            Reactivate Subscription
          </EmailButton>
        </div>

        <EmailDivider />

        <EmailText size={5} color="muted" marginBottom="8px">
          We're sorry to see you go. Your feedback helps us improve - we'd love
          to hear about your experience.
        </EmailText>

        <EmailText size={5} color="muted" marginBottom="0">
          Reply to this email or contact us at{' '}
          <a
            href="mailto:support@hypro.app"
            style={{ color: '#0f172a', textDecoration: 'underline' }}
          >
            support@hypro.app
          </a>
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
        <EmailHeading size={2} marginBottom="12px">
          Subscription ended
        </EmailHeading>

        <EmailText marginBottom="24px">
          {userName ? `Hi ${userName},` : 'Hello,'}
        </EmailText>

        <EmailText marginBottom="24px">
          Your <strong>{packageName}</strong> subscription has ended and has
          been removed from your account.
        </EmailText>

        <EmailText marginBottom="24px">
          You can still access your basic Hypro account and create a new
          subscription anytime to regain access to premium features.
        </EmailText>

        <EmailDivider />

        <EmailText size={5} color="muted" marginBottom="8px">
          We're sorry to see you go. Your feedback is valuable to us - we'd love
          to hear about your experience.
        </EmailText>

        <EmailText size={5} color="muted" marginBottom="0">
          Contact us anytime at{' '}
          <a
            href="mailto:support@hypro.app"
            style={{ color: '#0f172a', textDecoration: 'underline' }}
          >
            support@hypro.app
          </a>
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
    : `Thank you for subscribing to ${packageName}! Your premium access is now active and ready to elevate your fitness journey.`

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
        <EmailHeading size={2} marginBottom="12px">
          {greeting}
        </EmailHeading>

        <EmailText marginBottom="24px">
          {userName ? `Hi ${userName},` : 'Hello,'}
        </EmailText>

        <EmailText marginBottom="28px">{message}</EmailText>

        <EmailText marginBottom="16px">
          Your premium membership includes:
        </EmailText>

        <EmailCard>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>✓</span>
              <span>Unlimited workout plans and programs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>✓</span>
              <span>Advanced progress tracking and analytics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>✓</span>
              <span>Complete exercise library with video instructions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>✓</span>
              <span>Personalized meal planning and nutrition tools</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>✓</span>
              <span>Priority customer support and guidance</span>
            </div>
          </div>
        </EmailCard>

        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <EmailButton href={dashboardUrl} size="lg">
            Access Your Dashboard
          </EmailButton>
        </div>

        <EmailDivider />

        <EmailText size={5} color="muted" marginBottom="0">
          Need help getting started? Our support team is here for you at{' '}
          <a
            href="mailto:support@hypro.app"
            style={{ color: '#0f172a', textDecoration: 'underline' }}
          >
            support@hypro.app
          </a>
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
        <EmailHeading size={2} marginBottom="12px">
          Final notice: Action required
        </EmailHeading>

        <EmailText marginBottom="24px">
          {userName ? `Hi ${userName},` : 'Hello,'}
        </EmailText>

        <EmailAlert type="error">
          <strong>
            Your {packageName} subscription will be cancelled in {daysRemaining}{' '}
            {dayText}
          </strong>{' '}
          due to payment issues.
        </EmailAlert>

        <EmailText marginBottom="24px">
          This is your final reminder to update your payment method and maintain
          your premium access.
        </EmailText>

        <EmailAlert type="warning">
          After {daysRemaining} {dayText}, you'll lose access to all premium
          features including:
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div>• Unlimited workout plans</div>
            <div>• Progress tracking tools</div>
            <div>• Premium exercise library</div>
            <div>• Meal planning features</div>
          </div>
        </EmailAlert>

        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <EmailButton
            href={updatePaymentUrl}
            size="lg"
            backgroundColor="#dc2626"
          >
            Update Payment Method Now
          </EmailButton>
        </div>

        <EmailDivider />

        <EmailText size={5} color="muted" marginBottom="0">
          Need immediate assistance? Contact our support team at{' '}
          <a
            href="mailto:support@hypro.app"
            style={{
              color: '#dc2626',
              textDecoration: 'underline',
              fontWeight: '600',
            }}
          >
            support@hypro.app
          </a>
        </EmailText>
      </EmailContent>
      <EmailFooter companyName="Hypro" />
    </EmailWrapper>
  )
}
