import { redirect } from 'next/navigation'

import { verifyEmailAccessToken } from '@/lib/auth/email-access-token'
import { prisma } from '@/lib/db'
import { getBaseUrl } from '@/lib/get-base-url'
import { stripe } from '@/lib/stripe/stripe'

/**
 * Server page that creates a Stripe billing portal session directly from token.
 * User clicks email link → arrives here with token → redirects to Stripe portal.
 *
 * This is simpler and more reliable than:
 * email-access → authenticate → redirect → client useUser() → API call → redirect
 */
export default async function BillingPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    redirect('/login?error=missing_token')
  }

  // Verify token server-side
  const tokenData = verifyEmailAccessToken(token)
  if (!tokenData) {
    redirect('/login?error=invalid_token')
  }

  // Get user's Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { id: tokenData.userId },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) {
    // No Stripe customer - redirect to account management with error
    redirect('/account-management?error=no_subscription')
  }

  // Create portal session and redirect immediately
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${getBaseUrl()}/account-management`,
    })

    redirect(portalSession.url)
  } catch (error) {
    console.error('Failed to create Stripe portal session:', error)
    redirect('/account-management?error=portal_failed')
  }
}
