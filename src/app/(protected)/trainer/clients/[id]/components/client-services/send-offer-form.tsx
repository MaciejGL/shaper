'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

import { BundleSummary } from './bundle-summary'
import { PackageSelection } from './package-selection'
import {
  SelectedPackageItem,
  SendOfferFormProps,
  TrainerPackage,
} from './types'
import {
  findInPersonDiscountPercentage,
  findMealTrainingBundleDiscount,
} from './utils'

export function SendOfferForm({
  trainerId,
  clientId,
  clientEmail,
  clientName,
  onSuccess,
}: SendOfferFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPackages, setSelectedPackages] = useState<
    SelectedPackageItem[]
  >([])
  const [personalMessage, setPersonalMessage] = useState('')

  // Package fetching state
  const [packages, setPackages] = useState<TrainerPackage[]>([])
  const [packagesLoading, setPackagesLoading] = useState(false)
  const [packagesError, setPackagesError] = useState<string | null>(null)

  // Fetch client's coaching subscription status
  const { data: subscriptionData } = useCurrentSubscription(clientId, {
    lookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
  })

  const hasCoachingSubscription =
    subscriptionData?.subscription?.package?.stripeLookupKey ===
      STRIPE_LOOKUP_KEYS.PREMIUM_COACHING &&
    (subscriptionData?.status === 'ACTIVE' ||
      subscriptionData?.status === 'CANCELLED_ACTIVE')

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    setPackagesLoading(true)
    setPackagesError(null)

    try {
      const response = await fetch('/api/trainer-packages')
      if (!response.ok) {
        throw new Error('Failed to fetch packages')
      }

      const data = await response.json()
      setPackages(data.packages || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
      setPackagesError(
        error instanceof Error ? error.message : 'Failed to load packages',
      )
    } finally {
      setPackagesLoading(false)
    }
  }

  const handleSendOffer = async () => {
    if (selectedPackages.length === 0) {
      toast.error('Please add at least one package to your offer')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/create-trainer-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId,
          clientEmail,
          packages: selectedPackages.map((item) => ({
            packageId: item.packageId,
            quantity: item.quantity,
          })),
          personalMessage: personalMessage || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Offer sent successfully')
        onSuccess()
      } else {
        toast.error(result.error || 'Failed to send offer')
      }
    } catch (error) {
      console.error('Error sending offer:', error)
      toast.error('Failed to send offer. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions for managing package selection
  const togglePackage = (packageId: string, checked: boolean) => {
    if (checked) {
      const packageData = packages.find((p) => p.id === packageId)
      if (!packageData) return

      const newItem: SelectedPackageItem = {
        packageId,
        quantity: 1,
        package: packageData,
      }

      setSelectedPackages((prev) => [...prev, newItem])
    } else {
      setSelectedPackages((prev) =>
        prev.filter((item) => item.packageId !== packageId),
      )
    }
  }

  const updateQuantity = (packageId: string, quantity: number) => {
    setSelectedPackages((prev) =>
      prev.map((item) =>
        item.packageId === packageId
          ? { ...item, quantity: Math.max(1, Math.min(20, quantity)) }
          : item,
      ),
    )
  }

  // Calculate bundle discount from selected packages and subscription status
  const bundleDiscount = findInPersonDiscountPercentage(
    selectedPackages.map((item) => item.package),
    hasCoachingSubscription,
  )
  const mealTrainingDiscount = findMealTrainingBundleDiscount(
    selectedPackages.map((item) => item.package),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div>
          <h3 className="text-lg font-semibold">Create Training Bundle</h3>
          <p className="text-sm text-muted-foreground">
            Build a custom training package by selecting multiple services for{' '}
            {clientName}
          </p>
        </div>
      </div>

      {/* Package Selection */}
      <PackageSelection
        packages={packages}
        selectedPackages={selectedPackages}
        onTogglePackage={togglePackage}
        onUpdateQuantity={updateQuantity}
        isLoading={packagesLoading}
        error={packagesError}
        onRetry={fetchPackages}
        clientName={clientName}
        bundleDiscount={bundleDiscount}
        mealTrainingDiscount={mealTrainingDiscount}
        hasCoachingSubscription={hasCoachingSubscription}
      />

      {/* Bundle Summary & Send */}
      {selectedPackages.length > 0 && (
        <BundleSummary
          selectedPackages={selectedPackages}
          personalMessage={personalMessage}
          setPersonalMessage={setPersonalMessage}
          clientName={clientName}
          handleSendOffer={handleSendOffer}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
