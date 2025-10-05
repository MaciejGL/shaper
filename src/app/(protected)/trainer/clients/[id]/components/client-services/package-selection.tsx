import { Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { PackageCard } from './package-card'
import { PackageSelectionProps } from './types'

/**
 * Package selection grid component that displays available training packages
 */
export function PackageSelection({
  packages,
  selectedPackages,
  onTogglePackage,
  onUpdateQuantity,
  isLoading,
  error,
  onRetry,
  clientName,
  bundleDiscount = 0,
  mealTrainingDiscount = 0,
}: PackageSelectionProps) {
  const isPackageSelected = (packageId: string): boolean => {
    return selectedPackages.some((item) => item.packageId === packageId)
  }

  const getSelectedPackageItem = (packageId: string) => {
    return selectedPackages.find((item) => item.packageId === packageId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Training Packages</CardTitle>
        <CardDescription>
          Choose the services you want to include in the bundle for {clientName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <span className="text-gray-600">Loading packages...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No packages available. Please sync packages in the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {packages.map((pkg) => {
              const isSelected = isPackageSelected(pkg.id)
              const selectedItem = getSelectedPackageItem(pkg.id)

              return (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  isSelected={isSelected}
                  selectedItem={selectedItem}
                  onToggle={onTogglePackage}
                  onUpdateQuantity={onUpdateQuantity}
                  bundleDiscount={bundleDiscount}
                  mealTrainingDiscount={mealTrainingDiscount}
                />
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
