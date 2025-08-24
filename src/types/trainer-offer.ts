import { ServiceType } from '@/generated/prisma/client'

/**
 * Package summary item stored in TrainerOffer.packageSummary JSON field
 * Contains essential package information for display and processing
 */
export interface PackageSummaryItem {
  packageId: string
  quantity: number
  name: string
  description?: string | null
  stripePriceId?: string | null
  // Simplified service info from metadata
  serviceType?: ServiceType | null
  serviceCategory?: string
}

/**
 * Array of package summary items - this is what gets stored in packageSummary JSON
 */
export type PackageSummary = PackageSummaryItem[]

/**
 * Input type for creating trainer offers
 */
export interface CreateOfferPackageInput {
  packageId: string
  quantity: number
}
