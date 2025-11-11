import { stripe } from './stripe'

/**
 * Fetch business name from Stripe Connect account
 */
export async function getConnectAccountBusinessName(
  accountId: string,
): Promise<string | null> {
  try {
    const account = await stripe.accounts.retrieve(accountId)

    return (
      account.business_profile?.name ||
      account.settings?.dashboard?.display_name ||
      account.company?.name ||
      null
    )
  } catch (error) {
    console.error(`Failed to fetch Connect account ${accountId}:`, error)
    return null
  }
}

/**
 * Build supplier name for invoice metadata
 * Format: "Business Name - Trainer First Last"
 */
export async function buildSupplierName(
  trainerFirstName: string,
  trainerLastName?: string | null,
  connectAccountId?: string | null,
): Promise<string> {
  const trainerName = trainerLastName
    ? `${trainerFirstName} ${trainerLastName}`
    : trainerFirstName

  if (!connectAccountId) {
    return trainerName
  }

  const businessName = await getConnectAccountBusinessName(connectAccountId)

  return businessName ? `${businessName} - ${trainerName}` : trainerName
}

