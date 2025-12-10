// lib/email/send-email.ts
import { render } from '@react-email/render'

import { generateEmailAccessToken } from '@/lib/auth/email-access-token'

import { resend } from './resend'
import { AccessLinkEmail } from './templates/access-link-email'
import { CoachingScheduledToEndEmail } from './templates/coaching-scheduled-to-end-email'
import { DisputeAlertEmail } from './templates/dispute-alert-email'
import { EmailChangeOtp } from './templates/email-change-otp'
import { NewUserWelcomeEmail } from './templates/new-user-welcome-email'
import { OfferExpiredEmail } from './templates/offer-expired-email'
import { OtpEmail } from './templates/otp-email'
import {
  PaymentReceivedEmail,
  PaymentReceivedEmailProps,
} from './templates/payment-received-email'
import { PremiumAccessEmail } from './templates/premium-access-email'
import { RefundNotificationEmail } from './templates/refund-notification-email'
import {
  GracePeriodEndingEmail,
  PaymentFailedEmail,
  SubscriptionCancelledEmail,
  SubscriptionDeletedEmail,
  TrialEndingEmail,
  WelcomeEmail,
} from './templates/subscription-emails'
import {
  SubscriptionPaymentReceivedEmail,
  SubscriptionPaymentReceivedEmailProps,
} from './templates/subscription-payment-received-email'
import { SubscriptionUpgradeCreditEmail } from './templates/subscription-upgrade-credit-email'
import { TeamInvitationEmail } from './templates/team-invitation-email'
import { TrainerOfferEmail } from './templates/trainer-offer-email'
import { TrialReminderEmail } from './templates/trial-reminder-email'
import { WeeklyProgressEmail } from './templates/weekly-progress-email'
import { WinbackEmail } from './templates/winback-email'
import { WorkoutMilestoneEmail } from './templates/workout-milestone-email'

const NO_REPLY_EMAIL = 'noreply@hypro.app'
const NO_REPLY_NAME = 'Hypro'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.hypro.app'

const FROM_EMAIL = `${NO_REPLY_NAME} <${NO_REPLY_EMAIL}>`

/**
 * Generate an authenticated URL with email access token
 * User will be auto-logged in when clicking this link
 */
function generateAuthenticatedUrl(
  userId: string,
  email: string,
  redirectPath: string,
): string {
  const token = generateEmailAccessToken(userId, email, redirectPath)
  return `${BASE_URL}/auth/email-access?token=${encodeURIComponent(token)}`
}

export const sendEmail = {
  otp: async (
    to: string,
    {
      otp,
      userName,
      isEmailChange,
      currentEmail,
      newEmail,
    }: {
      otp: string
      userName?: string | null
      isEmailChange?: boolean
      currentEmail?: string
      newEmail?: string
    },
  ) => {
    let html: string
    let subject: string

    if (isEmailChange && currentEmail && newEmail) {
      html = await render(
        <EmailChangeOtp
          code={otp}
          userName={userName}
          currentEmail={currentEmail}
          newEmail={newEmail}
        />,
      )
      subject = `Verify your new email address`
    } else {
      html = await render(<OtpEmail code={otp} userName={userName} />)
      subject = `Hypro verification code: ${otp}`
    }

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      })
    } catch (error) {
      console.error('Failed to send email:', error)
    }
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
      subject: `${packageName} trial ending soon - ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`,
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
      subject: `${packageName} payment issue - action needed`,
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
      subject: `${packageName} subscription cancelled - access until ${endDate}`,
      html,
    })
  },

  subscriptionDeleted: async (
    to: string,
    {
      userName,
      packageName,
    }: { userName?: string | null; packageName: string },
  ) => {
    const html = await render(
      <SubscriptionDeletedEmail
        userName={userName}
        packageName={packageName}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${packageName} subscription ended`,
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
        ? `${packageName} reactivated - welcome back!`
        : `${packageName} activated - welcome to premium!`,
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
      subject: `Urgent: ${packageName} ending in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} - update payment`,
      html,
    })
  },

  // Training offer email
  trainerOffer: async (
    to: string,
    {
      clientName,
      trainerName,
      bundleItems,
      personalMessage,
      offerUrl,
      expiresAt,
    }: {
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
    },
  ) => {
    const html = await render(
      <TrainerOfferEmail
        clientName={clientName}
        trainerName={trainerName}
        bundleItems={bundleItems}
        personalMessage={personalMessage}
        offerUrl={offerUrl}
        expiresAt={expiresAt}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${trainerName} created a custom training package for you`,
      html,
    })
  },

  // Team invitation email
  teamInvitation: async (
    to: string,
    {
      invitedUserName,
      inviterName,
      teamName,
      locations,
      invitationUrl,
    }: {
      invitedUserName?: string | null
      inviterName: string
      teamName: string
      locations: string[]
      invitationUrl: string
    },
  ) => {
    const html = await render(
      <TeamInvitationEmail
        invitedUserName={invitedUserName}
        inviterName={inviterName}
        teamName={teamName}
        locations={locations}
        invitationUrl={invitationUrl}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${inviterName} invited you to join the ${teamName} team`,
      html,
    })
  },

  // Refund notification (for trainers)
  refundNotification: async (
    to: string,
    {
      trainerName,
      clientName,
      packageName,
      refundAmount,
      currency,
      refundReason,
    }: {
      trainerName: string
      clientName: string
      packageName: string
      refundAmount: string
      currency: string
      refundReason: string
    },
  ) => {
    const html = await render(
      <RefundNotificationEmail
        trainerName={trainerName}
        clientName={clientName}
        packageName={packageName}
        refundAmount={refundAmount}
        currency={currency}
        refundReason={refundReason}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Refund processed for ${clientName} - ${packageName}`,
      html,
    })
  },

  // Dispute alert (for admins)
  disputeAlert: async (
    to: string,
    {
      adminName,
      disputeId,
      chargeId,
      amount,
      currency,
      reason,
      evidenceDueBy,
      trainerName,
      clientName,
      stripeDashboardUrl,
    }: {
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
    },
  ) => {
    const html = await render(
      <DisputeAlertEmail
        adminName={adminName}
        disputeId={disputeId}
        chargeId={chargeId}
        amount={amount}
        currency={currency}
        reason={reason}
        evidenceDueBy={evidenceDueBy}
        trainerName={trainerName}
        clientName={clientName}
        stripeDashboardUrl={stripeDashboardUrl}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🚨 URGENT: Payment Dispute - ${amount} ${currency} (Evidence due: ${evidenceDueBy})`,
      html,
    })
  },

  // Offer expired notification (for trainers)
  offerExpired: async (
    to: string,
    {
      trainerName,
      clientEmail,
      bundleDescription,
      expiresAt,
    }: {
      trainerName: string
      clientEmail: string
      bundleDescription: string
      expiresAt: string
    },
  ) => {
    const html = await render(
      <OfferExpiredEmail
        trainerName={trainerName}
        clientEmail={clientEmail}
        bundleDescription={bundleDescription}
        expiresAt={expiresAt}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Offer expired - ${clientEmail} did not complete payment`,
      html,
    })
  },

  // Payment received notification (for trainers)
  paymentReceived: async (
    to: string,
    props: PaymentReceivedEmailProps,
  ): Promise<void> => {
    const html = await render(<PaymentReceivedEmail {...props} />)

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Payment received from ${props.clientName} - ${props.totalAmount} ${props.currency.toUpperCase()}`,
      html,
    })
  },

  // Subscription payment received notification (for trainers)
  subscriptionPaymentReceived: async (
    to: string,
    props: SubscriptionPaymentReceivedEmailProps,
  ): Promise<void> => {
    const html = await render(<SubscriptionPaymentReceivedEmail {...props} />)

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Subscription payment from ${props.clientName} - ${props.amount} ${props.currency.toUpperCase()}`,
      html,
    })
  },

  // Subscription upgrade credit notification (for users)
  subscriptionUpgradeCredit: async (
    to: string,
    {
      userName,
      oldPackageName,
      newPackageName,
      creditAmount,
      currency,
      creditDate,
      nextBillingDate,
      newPlanPrice,
      amountAfterCredit,
    }: {
      userName?: string | null
      oldPackageName: string
      newPackageName: string
      creditAmount: string
      currency: string
      creditDate: string
      nextBillingDate: string
      newPlanPrice: string
      amountAfterCredit: string
    },
  ): Promise<void> => {
    const html = await render(
      <SubscriptionUpgradeCreditEmail
        userName={userName}
        oldPackageName={oldPackageName}
        newPackageName={newPackageName}
        creditAmount={creditAmount}
        currency={currency}
        creditDate={creditDate}
        nextBillingDate={nextBillingDate}
        newPlanPrice={newPlanPrice}
        amountAfterCredit={amountAfterCredit}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Credit applied from subscription upgrade - ${creditAmount} ${currency.toUpperCase()}`,
      html,
    })
  },

  // Coaching scheduled to end notification (for clients)
  coachingScheduledToEnd: async (
    to: string,
    {
      clientName,
      trainerName,
      endDate,
      packageName,
    }: {
      clientName?: string | null
      trainerName: string
      endDate: string
      packageName: string
    },
  ): Promise<void> => {
    const html = await render(
      <CoachingScheduledToEndEmail
        clientName={clientName}
        trainerName={trainerName}
        endDate={endDate}
        packageName={packageName}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your coaching with ${trainerName} is scheduled to end`,
      html,
    })
  },

  // Access link email (for account management)
  accessLink: async (
    to: string,
    {
      userId,
      userName,
      isSubscriber,
    }: {
      userId: string
      userName?: string | null
      isSubscriber: boolean
    },
  ): Promise<void> => {
    let accessUrl: string

    if (isSubscriber) {
      // Subscribers: direct link to billing-portal server page with token
      // billing-portal verifies token and redirects to Stripe portal
      const token = generateEmailAccessToken(userId, to, '/auth/billing-portal')
      accessUrl = `${BASE_URL}/auth/billing-portal?token=${encodeURIComponent(token)}`
    } else {
      // Non-subscribers: authenticated URL to account management
      accessUrl = generateAuthenticatedUrl(userId, to, '/account-management')
    }

    const html = await render(
      <AccessLinkEmail
        userName={userName}
        accessUrl={accessUrl}
        isSubscriber={isSubscriber}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: isSubscriber
        ? 'Your subscription management link'
        : 'Your account access link',
      html,
    })
  },

  // Premium access email (for upgrade from companion mode)
  premiumAccess: async (
    to: string,
    {
      userId,
      userName,
    }: {
      userId: string
      userName?: string | null
    },
  ): Promise<void> => {
    const upgradeUrl = generateAuthenticatedUrl(
      userId,
      to,
      '/account-management',
    )
    const html = await render(
      <PremiumAccessEmail userName={userName} upgradeUrl={upgradeUrl} />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your premium access link',
      html,
    })
  },

  // New user welcome email
  newUserWelcome: async (
    to: string,
    {
      userId,
      userName,
    }: {
      userId: string
      userName?: string | null
    },
  ): Promise<void> => {
    const upgradeUrl = generateAuthenticatedUrl(
      userId,
      to,
      '/account-management',
    )
    const html = await render(
      <NewUserWelcomeEmail userName={userName} upgradeUrl={upgradeUrl} />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to Hypro - Start your fitness journey',
      html,
    })
  },

  // Trial reminder email (sent 3 days after signup if no subscription)
  trialReminder: async (
    to: string,
    {
      userId,
      userName,
    }: {
      userId: string
      userName?: string | null
    },
  ): Promise<void> => {
    const upgradeUrl = generateAuthenticatedUrl(
      userId,
      to,
      '/account-management',
    )
    const html = await render(
      <TrialReminderEmail userName={userName} upgradeUrl={upgradeUrl} />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your first week with Hypro',
      html,
    })
  },

  // Workout milestone email (sent after 3rd workout if no subscription)
  workoutMilestone: async (
    to: string,
    {
      userId,
      userName,
      totalSets,
      exerciseCount,
      topExercises,
    }: {
      userId: string
      userName?: string | null
      totalSets: number
      exerciseCount: number
      topExercises: string[]
    },
  ): Promise<void> => {
    const upgradeUrl = generateAuthenticatedUrl(
      userId,
      to,
      '/account-management',
    )
    const html = await render(
      <WorkoutMilestoneEmail
        userName={userName}
        upgradeUrl={upgradeUrl}
        totalSets={totalSets}
        exerciseCount={exerciseCount}
        topExercises={topExercises}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Nice work on workout #3 - here's what we tracked",
      html,
    })
  },

  // Weekly progress email (sent 7 days after signup if active and no subscription)
  weeklyProgress: async (
    to: string,
    {
      userId,
      userName,
      workoutCount,
      totalSets,
      exerciseCount,
      topMuscleGroups,
    }: {
      userId: string
      userName?: string | null
      workoutCount: number
      totalSets: number
      exerciseCount: number
      topMuscleGroups: string[]
    },
  ): Promise<void> => {
    const upgradeUrl = generateAuthenticatedUrl(
      userId,
      to,
      '/account-management',
    )
    const html = await render(
      <WeeklyProgressEmail
        userName={userName}
        upgradeUrl={upgradeUrl}
        workoutCount={workoutCount}
        totalSets={totalSets}
        exerciseCount={exerciseCount}
        topMuscleGroups={topMuscleGroups}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your week: ${workoutCount} workouts, ${totalSets} sets logged`,
      html,
    })
  },

  // Win-back email (sent 14 days after last workout if no subscription)
  winback: async (
    to: string,
    {
      userId,
      userName,
      daysSinceLastWorkout,
      totalWorkouts,
      lastWorkoutName,
      lastWorkoutDate,
      topLifts,
    }: {
      userId: string
      userName?: string | null
      daysSinceLastWorkout: number
      totalWorkouts: number
      lastWorkoutName?: string | null
      lastWorkoutDate?: string | null
      topLifts: { name: string; weight: number; unit: string }[]
    },
  ): Promise<void> => {
    const upgradeUrl = generateAuthenticatedUrl(
      userId,
      to,
      '/account-management',
    )
    const html = await render(
      <WinbackEmail
        userName={userName}
        upgradeUrl={upgradeUrl}
        daysSinceLastWorkout={daysSinceLastWorkout}
        totalWorkouts={totalWorkouts}
        lastWorkoutName={lastWorkoutName}
        lastWorkoutDate={lastWorkoutDate}
        topLifts={topLifts}
      />,
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your last workout was ${daysSinceLastWorkout} days ago`,
      html,
    })
  },
}
