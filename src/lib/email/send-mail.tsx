// lib/email/send-email.ts
import { render } from '@react-email/render'

import { resend } from './resend'
import { OtpEmail } from './templates/otp-email'
import {
  GracePeriodEndingEmail,
  PaymentFailedEmail,
  SubscriptionCancelledEmail,
  TrialEndingEmail,
  WelcomeEmail,
} from './templates/subscription-emails'

const NO_REPLY_EMAIL = 'noreply@hypertro.app'
const NO_REPLY_NAME = 'Hypertro'

const FROM_EMAIL = `${NO_REPLY_NAME} <${NO_REPLY_EMAIL}>`

export const sendEmail = {
  otp: async (
    to: string,
    { otp, userName }: { otp: string; userName?: string | null },
  ) => {
    const html = await render(<OtpEmail code={otp} userName={userName} />)

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your Hypertro Login Code',
      html,
    })
  },

  // Subscription-related emails
  trialEnding: async (
    to: string,
    {
      userName,
      daysRemaining,
      packageName,
      upgradeUrl,
    }: {
      userName?: string | null
      daysRemaining: number
      packageName: string
      upgradeUrl: string
    },
  ) => {
    const html = await render(
      <TrialEndingEmail
        userName={userName}
        daysRemaining={daysRemaining}
        packageName={packageName}
        upgradeUrl={upgradeUrl}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your ${packageName} trial ends in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
      html,
    })
  },

  paymentFailed: async (
    to: string,
    {
      userName,
      gracePeriodDays,
      packageName,
      updatePaymentUrl,
    }: {
      userName?: string | null
      gracePeriodDays: number
      packageName: string
      updatePaymentUrl: string
    },
  ) => {
    const html = await render(
      <PaymentFailedEmail
        userName={userName}
        gracePeriodDays={gracePeriodDays}
        packageName={packageName}
        updatePaymentUrl={updatePaymentUrl}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Payment Failed - Action Required',
      html,
    })
  },

  subscriptionCancelled: async (
    to: string,
    {
      userName,
      packageName,
      endDate,
      reactivateUrl,
    }: {
      userName?: string | null
      packageName: string
      endDate: string
      reactivateUrl: string
    },
  ) => {
    const html = await render(
      <SubscriptionCancelledEmail
        userName={userName}
        packageName={packageName}
        endDate={endDate}
        reactivateUrl={reactivateUrl}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Subscription Cancelled',
      html,
    })
  },

  subscriptionWelcome: async (
    to: string,
    {
      userName,
      packageName,
      isReactivation = false,
      dashboardUrl,
    }: {
      userName?: string | null
      packageName: string
      isReactivation?: boolean
      dashboardUrl: string
    },
  ) => {
    const html = await render(
      <WelcomeEmail
        userName={userName}
        packageName={packageName}
        isReactivation={isReactivation}
        dashboardUrl={dashboardUrl}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: isReactivation
        ? `Welcome back to ${packageName}!`
        : `Welcome to ${packageName}!`,
      html,
    })
  },

  gracePeriodEnding: async (
    to: string,
    {
      userName,
      packageName,
      daysRemaining,
      updatePaymentUrl,
    }: {
      userName?: string | null
      packageName: string
      daysRemaining: number
      updatePaymentUrl: string
    },
  ) => {
    const html = await render(
      <GracePeriodEndingEmail
        userName={userName}
        packageName={packageName}
        daysRemaining={daysRemaining}
        updatePaymentUrl={updatePaymentUrl}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Final Notice: ${packageName} subscription ending in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
      html,
    })
  },
}
