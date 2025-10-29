import { Minus, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { PackageCardProps } from './types'
import {
  allowsQuantitySelection,
  formatOriginalPrice,
  formatPrice,
  getDiscountPercentage,
  getServiceDescription,
  hasAnyDiscount,
} from './utils'

/**
 * Individual package card component for selecting and configuring training packages
 */
export function PackageCard({
  package: pkg,
  isSelected,
  selectedItem,
  onToggle,
  onUpdateQuantity,
  bundleDiscount = 0,
  mealTrainingDiscount = 0,
  hasCoachingSubscription = false,
}: PackageCardProps) {
  return (
    <Card
      className={cn('transition-colors', {
        'border-primary bg-primary/5': isSelected,
        'border-border': !isSelected,
      })}
    >
      <CardHeader className="flex items-start gap-2">
        <Checkbox
          id={`package-${pkg.id}`}
          checked={isSelected}
          onCheckedChange={(checked) => onToggle(pkg.id, checked === true)}
          className="mt-1"
        />{' '}
        <CardTitle>{pkg.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {pkg.serviceType && (
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">
              {getServiceDescription(pkg.serviceType)}
            </Badge>
          </div>
        )}
        {pkg.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 max-w-prose">
            {pkg.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t">
        {/* Quantity Selection - Only show when selected and quantity is allowed */}
        {isSelected && allowsQuantitySelection(pkg) && selectedItem && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  onUpdateQuantity(pkg.id, selectedItem.quantity - 1)
                }
                disabled={selectedItem.quantity <= 1}
                iconOnly={<Minus />}
              />
              <Input
                id={`quantity-${pkg.id}`}
                className="w-16 text-center text-sm"
                value={selectedItem.quantity}
                onChange={(e) =>
                  onUpdateQuantity(pkg.id, Number(e.target.value))
                }
                onBlur={() => onUpdateQuantity(pkg.id, selectedItem.quantity)}
                type="number"
                min="1"
                max="20"
              />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  onUpdateQuantity(pkg.id, selectedItem.quantity + 1)
                }
                disabled={selectedItem.quantity >= 20}
                iconOnly={<Plus />}
              />
            </div>
          </div>
        )}
        <div className="text-right ml-auto">
          {hasAnyDiscount(
            pkg,
            bundleDiscount,
            mealTrainingDiscount,
            hasCoachingSubscription,
          ) ? (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground line-through">
                {formatOriginalPrice(pkg, selectedItem?.quantity || 1)}
              </span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-700"
                >
                  {getDiscountPercentage(
                    pkg,
                    bundleDiscount,
                    mealTrainingDiscount,
                    hasCoachingSubscription,
                  )}
                  % off
                </Badge>
                <span className="text-sm text-green-600 font-medium">
                  {formatPrice(
                    pkg,
                    selectedItem?.quantity || 1,
                    bundleDiscount,
                    mealTrainingDiscount,
                    hasCoachingSubscription,
                  )}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-sm text-green-600 font-medium">
              {formatPrice(
                pkg,
                selectedItem?.quantity || 1,
                bundleDiscount,
                mealTrainingDiscount,
                hasCoachingSubscription,
              )}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
