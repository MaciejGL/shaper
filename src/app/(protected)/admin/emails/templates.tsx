import * as React from 'react'

import { DisputeAlertEmail } from '@/lib/email/templates/dispute-alert-email'
import { EmailChangeOtp } from '@/lib/email/templates/email-change-otp'
import { OfferExpiredEmail } from '@/lib/email/templates/offer-expired-email'
import { OtpEmail } from '@/lib/email/templates/otp-email'
import { PaymentReceivedEmail } from '@/lib/email/templates/payment-received-email'
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

export interface EmailTemplateConfig {
  id: string
  name: string
  category: 'Auth' | 'Subscription' | 'Payments' | 'Trainer/Client'
  component: React.ComponentType<any>
  props: any
}

export const emailTemplates: EmailTemplateConfig[] = [
  // Auth
  {
    id: 'otp',
    name: 'OTP Verification',
    category: 'Auth',
    component: OtpEmail,
    props: {
      code: '1234',
      userName: 'John Doe',
    },
  },
  {
    id: 'email-change-otp',
    name: 'Email Change OTP',
    category: 'Auth',
    component: EmailChangeOtp,
    props: {
      code: '5678',
      userName: 'John Doe',
      currentEmail: 'john@example.com',
      newEmail: 'john.new@example.com',
    },
  },

  // Subscription
  {
    id: 'welcome-email',
    name: 'Welcome / Reactivation',
    category: 'Subscription',
    component: WelcomeEmail,
    props: {
      userName: 'John Doe',
      packageName: 'Pro Plan',
      isReactivation: false,
      dashboardUrl: 'https://hypro.app/dashboard',
    },
  },
  {
    id: 'trial-ending',
    name: 'Trial Ending',
    category: 'Subscription',
    component: TrialEndingEmail,
    props: {
      userName: 'John Doe',
      daysRemaining: 3,
      packageName: 'Pro Plan',
      upgradeUrl: 'https://hypro.app/settings/billing',
    },
  },
  {
    id: 'grace-period-ending',
    name: 'Grace Period Ending',
    category: 'Subscription',
    component: GracePeriodEndingEmail,
    props: {
      userName: 'John Doe',
      packageName: 'Pro Plan',
      daysRemaining: 2,
      updatePaymentUrl: 'https://hypro.app/settings/billing',
    },
  },
  {
    id: 'payment-failed',
    name: 'Payment Failed',
    category: 'Subscription',
    component: PaymentFailedEmail,
    props: {
      userName: 'John Doe',
      gracePeriodDays: 7,
      packageName: 'Pro Plan',
      updatePaymentUrl: 'https://hypro.app/settings/billing',
    },
  },
  {
    id: 'subscription-cancelled',
    name: 'Subscription Cancelled',
    category: 'Subscription',
    component: SubscriptionCancelledEmail,
    props: {
      userName: 'John Doe',
      packageName: 'Pro Plan',
      endDate: 'December 31, 2025',
      reactivateUrl: 'https://hypro.app/settings/billing',
    },
  },
  {
    id: 'subscription-deleted',
    name: 'Subscription Deleted',
    category: 'Subscription',
    component: SubscriptionDeletedEmail,
    props: {
      userName: 'John Doe',
      packageName: 'Pro Plan',
    },
  },

  // Payments
  {
    id: 'payment-received',
    name: 'Payment Received (One-time)',
    category: 'Payments',
    component: PaymentReceivedEmail,
    props: {
      trainerName: 'Coach Mike',
      clientName: 'Jane Smith',
      clientEmail: 'jane@example.com',
      packageNames: ['10 Sessions Pack', 'Nutrition Plan'],
      totalAmount: '500.00',
      currency: 'USD',
      paymentType: 'one-time',
      clientProfileUrl: 'https://hypro.app/trainer/clients/123',
    },
  },
  {
    id: 'subscription-payment-received',
    name: 'Subscription Payment Received',
    category: 'Payments',
    component: SubscriptionPaymentReceivedEmail,
    props: {
      trainerName: 'Coach Mike',
      clientName: 'Jane Smith',
      clientEmail: 'jane@example.com',
      subscriptionType: 'Gold Coaching',
      amount: '150.00',
      currency: 'USD',
      billingPeriod: 'monthly',
      nextBillingDate: 'November 23, 2025',
      clientProfileUrl: 'https://hypro.app/trainer/clients/123',
    },
  },
  {
    id: 'subscription-upgrade-credit',
    name: 'Subscription Upgrade Credit',
    category: 'Payments',
    component: SubscriptionUpgradeCreditEmail,
    props: {
      userName: 'John Doe',
      oldPackageName: 'Basic Plan',
      newPackageName: 'Pro Plan',
      creditAmount: '15.50',
      currency: 'USD',
      creditDate: 'October 23, 2025',
      nextBillingDate: 'November 23, 2025',
      newPlanPrice: '29.99',
      amountAfterCredit: '14.49',
    },
  },
  {
    id: 'refund-notification',
    name: 'Refund Notification',
    category: 'Payments',
    component: RefundNotificationEmail,
    props: {
      trainerName: 'Coach Mike',
      clientName: 'Jane Smith',
      packageName: '10 Sessions Pack',
      refundAmount: '500.00',
      currency: 'USD',
      refundReason: 'requested_by_customer',
    },
  },
  {
    id: 'dispute-alert',
    name: 'Dispute Alert',
    category: 'Payments',
    component: DisputeAlertEmail,
    props: {
      adminName: 'Admin',
      disputeId: 'dp_123456789',
      chargeId: 'ch_123456789',
      amount: '500.00',
      currency: 'USD',
      reason: 'fraudulent',
      evidenceDueBy: 'October 30, 2025',
      trainerName: 'Coach Mike',
      clientName: 'Jane Smith',
      stripeDashboardUrl: 'https://dashboard.stripe.com/disputes/dp_123',
    },
  },

  // Trainer/Client
  {
    id: 'trainer-offer',
    name: 'Trainer Offer',
    category: 'Trainer/Client',
    component: TrainerOfferEmail,
    props: {
      clientName: 'Jane Smith',
      trainerName: 'Coach Mike',
      bundleItems: [
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
      ],
      personalMessage: "Hey Jane, here's the package we discussed!",
      offerUrl: 'https://hypro.app/offers/123',
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 7 days from now
    },
  },
  {
    id: 'offer-expired',
    name: 'Offer Expired',
    category: 'Trainer/Client',
    component: OfferExpiredEmail,
    props: {
      trainerName: 'Coach Mike',
      clientEmail: 'jane@example.com',
      bundleDescription: 'Personal Training + Nutrition',
      expiresAt: 'October 23, 2025',
    },
  },
  {
    id: 'team-invitation',
    name: 'Team Invitation',
    category: 'Trainer/Client',
    component: TeamInvitationEmail,
    props: {
      invitedUserName: 'Jane Smith',
      inviterName: 'Coach Mike',
      teamName: 'Elite Performance',
      locations: ['Downtown Gym', 'Westside Fitness'],
      invitationUrl: 'https://hypro.app/teams/invite/123',
    },
  },
]

