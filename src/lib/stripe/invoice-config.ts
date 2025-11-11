/**
 * Norwegian Invoice Compliance Configuration
 */

export const INVOICE_CONFIG = {
  // Show 0% VAT on invoices (set false after VAT registration)
  STRIPE_SHOW_ZERO_VAT_ON_INVOICE:
    process.env.STRIPE_SHOW_ZERO_VAT_ON_INVOICE === 'true',

  // Norwegian organization number
  STRIPE_NORWEGIAN_ORG_NUMBER: process.env.STRIPE_NORWEGIAN_ORG_NUMBER || '',

  // Stripe 0% tax rate ID
  STRIPE_TAX_RATE_0_PERCENT: process.env.STRIPE_TAX_RATE_0_PERCENT || '',

  // Norwegian invoice template ID
  INVOICE_TEMPLATE_ID: process.env.STRIPE_INVOICE_TEMPLATE_ID || '',
} as const

/**
 * Helper to check if 0% VAT should be applied
 */
export function shouldApplyZeroVat(): boolean {
  return (
    INVOICE_CONFIG.STRIPE_SHOW_ZERO_VAT_ON_INVOICE &&
    !!INVOICE_CONFIG.STRIPE_TAX_RATE_0_PERCENT
  )
}

/**
 * Get 0% tax rate ID if enabled
 */
export function getZeroVatTaxRateId(): string | null {
  return shouldApplyZeroVat() ? INVOICE_CONFIG.STRIPE_TAX_RATE_0_PERCENT : null
}

/**
 * Get invoice metadata for Norwegian compliance
 */
export function getInvoiceMetadata(): Record<string, string> {
  const metadata: Record<string, string> = {}

  if (INVOICE_CONFIG.STRIPE_NORWEGIAN_ORG_NUMBER) {
    metadata.norwegian_org_number = INVOICE_CONFIG.STRIPE_NORWEGIAN_ORG_NUMBER
  }

  return metadata
}

/**
 * Get invoice template configuration for customer
 */
export function getInvoiceTemplateConfig() {
  return {
    rendering_options: {
      template: INVOICE_CONFIG.INVOICE_TEMPLATE_ID,
    },
  }
}
