import * as React from 'react'

import { AccessLinkEmail } from '@/lib/email/templates/access-link-email'
import { CoachingScheduledToEndEmail } from '@/lib/email/templates/coaching-scheduled-to-end-email'
import { DisputeAlertEmail } from '@/lib/email/templates/dispute-alert-email'
import { EmailChangeOtp } from '@/lib/email/templates/email-change-otp'
import { NewUserWelcomeEmail } from '@/lib/email/templates/new-user-welcome-email'
import { OfferExpiredEmail } from '@/lib/email/templates/offer-expired-email'
import { OtpEmail } from '@/lib/email/templates/otp-email'
import { PaymentReceivedEmail } from '@/lib/email/templates/payment-received-email'
import { PremiumAccessEmail } from '@/lib/email/templates/premium-access-email'
import { RefundNotificationEmail } from '@/lib/email/templates/refund-notification-email'
import {
  GracePeriodEndingEmail,
  PaymentFailedEmail,
  SubscriptionCancelledEmail,
  SubscriptionDeletedEmail,
  TrialEndingEmail,
  WelcomeEmail,
} from '@/lib/email/templates/subscription-emails'
import { SubscriptionPaymentReceivedEmail } from '@/lib/email/templates/subscription-payment-received-email'
import { SubscriptionUpgradeCreditEmail } from '@/lib/email/templates/subscription-upgrade-credit-email'
import { TeamInvitationEmail } from '@/lib/email/templates/team-invitation-email'
import { TrainerOfferEmail } from '@/lib/email/templates/trainer-offer-email'
import { TrialReminderEmail } from '@/lib/email/templates/trial-reminder-email'
import { WeeklyProgressEmail } from '@/lib/email/templates/weekly-progress-email'
import { WinbackEmail } from '@/lib/email/templates/winback-email'
import { WorkoutMilestoneEmail } from '@/lib/email/templates/workout-milestone-email'

export interface EmailTemplateConfig {
  id: string
  name: string
  category: 'Auth' | 'Subscription' | 'Payments' | 'Trainer/Client'
  render: () => React.ReactElement
}

export const emailTemplates: EmailTemplateConfig[] = [
  // Auth
  {
    id: 'otp',
    name: 'OTP Verification',
    category: 'Auth',
    render: () => <OtpEmail code="1234" userName="John Doe" />,
  },
  {
    id: 'email-change-otp',
    name: 'Email Change OTP',
    category: 'Auth',
    render: () => (
      <EmailChangeOtp
        code="5678"
        userName="John Doe"
        currentEmail="john@example.com"
        newEmail="john.new@example.com"
      />
    ),
  },

  // Subscription
  {
    id: 'welcome-email',
    name: 'Welcome / Reactivation',
    category: 'Subscription',
    render: () => (
      <WelcomeEmail
        userName="John Doe"
        packageName="Pro Plan"
        isReactivation={false}
        dashboardUrl="https://hypro.app/workout"
      />
    ),
  },
  {
    id: 'new-user-welcome',
    name: 'New User Welcome',
    category: 'Subscription',
    render: () => (
      <NewUserWelcomeEmail
        userName="John Doe"
        upgradeUrl="https://hypro.app/account-management"
      />
    ),
  },
  {
    id: 'trial-ending',
    name: 'Trial Ending',
    category: 'Subscription',
    render: () => (
      <TrialEndingEmail
        userName="John Doe"
        daysRemaining={3}
        packageName="Pro Plan"
        upgradeUrl="https://hypro.app/account-management"
      />
    ),
  },
  {
    id: 'trial-reminder',
    name: 'Trial Reminder',
    category: 'Subscription',
    render: () => (
      <TrialReminderEmail
        userName="John Doe"
        upgradeUrl="https://hypro.app/account-management"
      />
    ),
  },
  {
    id: 'grace-period-ending',
    name: 'Grace Period Ending',
    category: 'Subscription',
    render: () => (
      <GracePeriodEndingEmail
        userName="John Doe"
        packageName="Pro Plan"
        daysRemaining={2}
        updatePaymentUrl="https://hypro.app/account-management"
      />
    ),
  },
  {
    id: 'payment-failed',
    name: 'Payment Failed',
    category: 'Subscription',
    render: () => (
      <PaymentFailedEmail
        userName="John Doe"
        gracePeriodDays={7}
        packageName="Pro Plan"
        updatePaymentUrl="https://hypro.app/account-management"
      />
    ),
  },
  {
    id: 'subscription-cancelled',
    name: 'Subscription Cancelled',
    category: 'Subscription',
    render: () => (
      <SubscriptionCancelledEmail
        userName="John Doe"
        packageName="Pro Plan"
        endDate="December 31, 2025"
        reactivateUrl="https://hypro.app/account-management"
      />
    ),
  },
  {
    id: 'subscription-deleted',
    name: 'Subscription Deleted',
    category: 'Subscription',
    render: () => (
      <SubscriptionDeletedEmail userName="John Doe" packageName="Pro Plan" />
    ),
  },
  {
    id: 'premium-access',
    name: 'Premium Access Link',
    category: 'Subscription',
    render: () => (
      <PremiumAccessEmail
        userName="John Doe"
        upgradeUrl="https://hypro.app/account-management"
      />
    ),
  },
  {
    id: 'access-link',
    name: 'Account Access Link',
    category: 'Subscription',
    render: () => (
      <AccessLinkEmail
        userName="John Doe"
        accessUrl="https://hypro.app/account-management"
        isSubscriber
      />
    ),
  },

  // Payments
  {
    id: 'payment-received',
    name: 'Payment Received (One-time)',
    category: 'Payments',
    render: () => (
      <PaymentReceivedEmail
        trainerName="Coach Mike"
        clientName="Jane Smith"
        clientEmail="jane@example.com"
        packageNames={['10 Sessions Pack', 'Nutrition Plan']}
        totalAmount="500.00"
        currency="USD"
        paymentType="one-time"
        clientProfileUrl="https://hypro.app/trainer/clients/123"
      />
    ),
  },
  {
    id: 'subscription-payment-received',
    name: 'Subscription Payment Received',
    category: 'Payments',
    render: () => (
      <SubscriptionPaymentReceivedEmail
        trainerName="Coach Mike"
        clientName="Jane Smith"
        clientEmail="jane@example.com"
        subscriptionType="Gold Coaching"
        amount="150.00"
        currency="USD"
        billingPeriod="monthly"
        nextBillingDate="November 23, 2025"
        clientProfileUrl="https://hypro.app/trainer/clients/123"
      />
    ),
  },
  {
    id: 'subscription-upgrade-credit',
    name: 'Subscription Upgrade Credit',
    category: 'Payments',
    render: () => (
      <SubscriptionUpgradeCreditEmail
        userName="John Doe"
        oldPackageName="Basic Plan"
        newPackageName="Pro Plan"
        creditAmount="15.50"
        currency="USD"
        creditDate="October 23, 2025"
        nextBillingDate="November 23, 2025"
        newPlanPrice="29.99"
        amountAfterCredit="14.49"
      />
    ),
  },
  {
    id: 'refund-notification',
    name: 'Refund Notification',
    category: 'Payments',
    render: () => (
      <RefundNotificationEmail
        trainerName="Coach Mike"
        clientName="Jane Smith"
        packageName="10 Sessions Pack"
        refundAmount="500.00"
        currency="USD"
        refundReason="requested_by_customer"
      />
    ),
  },
  {
    id: 'dispute-alert',
    name: 'Dispute Alert',
    category: 'Payments',
    render: () => (
      <DisputeAlertEmail
        adminName="Admin"
        disputeId="dp_123456789"
        chargeId="ch_123456789"
        amount="500.00"
        currency="USD"
        reason="fraudulent"
        evidenceDueBy="October 30, 2025"
        trainerName="Coach Mike"
        clientName="Jane Smith"
        stripeDashboardUrl="https://dashboard.stripe.com/disputes/dp_123"
      />
    ),
  },
  {
    id: 'weekly-progress',
    name: 'Weekly Progress',
    category: 'Payments',
    render: () => (
      <WeeklyProgressEmail
        userName="John Doe"
        upgradeUrl="https://hypro.app/account-management"
        workoutCount={4}
        totalSets={72}
        exerciseCount={18}
        topMuscleGroups={['Chest', 'Back', 'Quads']}
      />
    ),
  },
  {
    id: 'workout-milestone',
    name: 'Workout Milestone',
    category: 'Payments',
    render: () => (
      <WorkoutMilestoneEmail
        userName="John Doe"
        upgradeUrl="https://hypro.app/account-management"
        totalSets={54}
        exerciseCount={14}
        topExercises={['Bench Press', 'Squat', 'Lat Pulldown']}
      />
    ),
  },
  {
    id: 'winback',
    name: 'Winback',
    category: 'Payments',
    render: () => (
      <WinbackEmail
        userName="John Doe"
        upgradeUrl="https://hypro.app/account-management"
        daysSinceLastWorkout={12}
        totalWorkouts={27}
        lastWorkoutName="Full Body A"
        lastWorkoutDate="Nov 8, 2025"
        topLifts={[
          { name: 'Bench Press', weight: 90, unit: 'kg' },
          { name: 'Squat', weight: 140, unit: 'kg' },
        ]}
      />
    ),
  },

  // Trainer/Client
  {
    id: 'trainer-offer',
    name: 'Trainer Offer',
    category: 'Trainer/Client',
    render: () => (
      <TrainerOfferEmail
        clientName="Jane Smith"
        trainerName="Coach Mike"
        bundleItems={[
          {
            quantity: 1,
            packageName: 'Personal Training',
            services: ['1-on-1 Session', 'Form Check'],
          },
          {
            quantity: 1,
            packageName: 'Nutrition Guide',
            services: ['Meal Plan'],
          },
        ]}
        personalMessage="Hey Jane, here's the package we discussed!"
        offerUrl="https://hypro.app/offers/123"
        expiresAt={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}
      />
    ),
  },
  {
    id: 'offer-expired',
    name: 'Offer Expired',
    category: 'Trainer/Client',
    render: () => (
      <OfferExpiredEmail
        trainerName="Coach Mike"
        clientEmail="jane@example.com"
        bundleDescription="Personal Training + Nutrition"
        expiresAt="October 23, 2025"
      />
    ),
  },
  {
    id: 'team-invitation',
    name: 'Team Invitation',
    category: 'Trainer/Client',
    render: () => (
      <TeamInvitationEmail
        invitedUserName="Jane Smith"
        inviterName="Coach Mike"
        teamName="Elite Performance"
        locations={['Downtown Gym', 'Westside Fitness']}
        invitationUrl="https://hypro.app/teams/invite/123"
      />
    ),
  },
  {
    id: 'coaching-scheduled-to-end',
    name: 'Coaching Scheduled To End',
    category: 'Trainer/Client',
    render: () => (
      <CoachingScheduledToEndEmail
        clientName="Jane Smith"
        trainerName="Coach Mike"
        endDate="December 31, 2025"
        packageName="Gold Coaching"
      />
    ),
  },
]
