import { GQLServiceType } from '@/generated/graphql-client'

export interface TrainerPackage {
  id: string
  name: string
  description: string | null
  stripeLookupKey: string | null
  pricing: {
    amount: number
    currency: string
    type: 'one-time' | 'subscription'
    recurring?: {
      interval: string
      interval_count: number
    } | null
  } | null
  serviceCategory: string
  serviceType: GQLServiceType | null
  packageSummary: PackageSummary | null
}

export interface PackageSummary {
  env?: string
  category?: string
  service_type?: string
  allows_addons?: string
  grants_premium?: string
  delivery_method?: string
  customer_service?: string
  billing_frequency?: string
  checkin_frequency?: string
  includes_services?: string
  partner_discounts?: string
  estimated_setup_days?: string
  commission_percentage?: string
  addon_discount_in_person?: string
  requires_trainer_assignment?: string
  in_person_discount_percentage?: string
}

export interface SelectedPackageItem {
  packageId: string
  quantity: number
  package: TrainerPackage
  // Custom discount applied by trainer (for coaching subscriptions)
  discountPercent?: number
  discountMonths?: number
}

export interface SendOfferFormProps {
  trainerId: string
  clientId: string
  clientEmail: string
  clientName: string
  hasCoachingSubscription: boolean
  onSuccess: () => void
}

export interface BundleSummaryProps {
  selectedPackages: SelectedPackageItem[]
  personalMessage: string
  setPersonalMessage: (message: string) => void
  clientName: string
  handleSendOffer: () => void
  isLoading: boolean
  onUpdateDiscount?: (
    packageId: string,
    discountPercent?: number,
    discountMonths?: number,
  ) => void
}

export interface PackageCardProps {
  package: TrainerPackage
  isSelected: boolean
  selectedItem?: SelectedPackageItem
  onToggle: (packageId: string, checked: boolean) => void
  onUpdateQuantity: (packageId: string, quantity: number) => void
  bundleDiscount?: number
  hasCoachingSubscription?: boolean
  disabled?: boolean
}

export interface PackageSelectionProps {
  packages: TrainerPackage[]
  selectedPackages: SelectedPackageItem[]
  onTogglePackage: (packageId: string, checked: boolean) => void
  onUpdateQuantity: (packageId: string, quantity: number) => void
  isLoading: boolean
  error: string | null
  onRetry: () => void
  clientName: string
  bundleDiscount?: number
  hasCoachingSubscription?: boolean
}

export interface OfferSuccessProps {
  clientName: string
}
