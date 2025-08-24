'use client'

import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface StripeProduct {
  id: string
  name: string
  description: string | null
  active: boolean
  metadata: Record<string, string>
  created: number
  updated: number
}

interface MetadataValidation {
  isValid: boolean
  productType: 'trainer_service' | 'trainer_coaching' | 'premium' | 'unknown'
  errors: string[]
  warnings: string[]
  requiredFields: string[]
  missingFields: string[]
}

export function ProductMetadataDiagnostics() {
  const [products, setProducts] = useState<StripeProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [validations, setValidations] = useState<
    Record<string, MetadataValidation>
  >({})

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stripe/products')
      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      const stripeProducts: StripeProduct[] = data.products || []
      setProducts(stripeProducts)

      // Validate each product's metadata
      const validationResults: Record<string, MetadataValidation> = {}
      stripeProducts.forEach((product) => {
        validationResults[product.id] = validateProductMetadata(
          product.metadata,
        )
      })
      setValidations(validationResults)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const validateProductMetadata = (
    metadata: Record<string, string>,
  ): MetadataValidation => {
    const validation: MetadataValidation = {
      isValid: false,
      productType: 'unknown',
      errors: [],
      warnings: [],
      requiredFields: [],
      missingFields: [],
    }

    // Check for trainer service products
    if (
      metadata?.category === 'trainer_service' ||
      metadata?.category === 'trainer_coaching'
    ) {
      validation.productType = metadata.category as
        | 'trainer_service'
        | 'trainer_coaching'
      validation.requiredFields = ['category', 'service_type']

      if (!metadata.service_type) {
        validation.errors.push('Missing required field: service_type')
        validation.missingFields.push('service_type')
      } else {
        const validServiceTypes = [
          'meal_plan',
          'workout_plan',
          'training_plan',
          'coaching_complete',
          'coaching_full',
          'coaching',
          'in_person_meeting',
          'in_person_session',
          'premium_access',
        ]
        if (!validServiceTypes.includes(metadata.service_type)) {
          validation.errors.push(
            `Invalid service_type: ${metadata.service_type}. Must be one of: ${validServiceTypes.join(', ')}`,
          )
        }
      }

      // Check optional but recommended fields
      if (!metadata.commission_percentage) {
        validation.warnings.push(
          'Missing recommended field: commission_percentage (should be "10")',
        )
      }

      if (
        validation.productType === 'trainer_coaching' &&
        !metadata.grants_premium
      ) {
        validation.warnings.push(
          'Missing recommended field: grants_premium (should be "true" for coaching)',
        )
      }

      validation.isValid = validation.errors.length === 0
    }
    // Check for premium products
    else if (metadata?.category === 'platform_premium') {
      validation.productType = 'premium'
      validation.requiredFields = ['category', 'duration']

      if (!metadata.duration) {
        validation.errors.push('Missing required field: duration')
        validation.missingFields.push('duration')
      } else if (!['MONTHLY', 'YEARLY'].includes(metadata.duration)) {
        validation.errors.push(
          `Invalid duration: ${metadata.duration}. Must be MONTHLY or YEARLY`,
        )
      }

      validation.isValid = validation.errors.length === 0
    }
    // Unknown product type
    else {
      validation.errors.push(
        'Product must have either trainer service metadata (category + service_type) or premium metadata (category=platform_premium + duration)',
      )
      validation.requiredFields = [
        'category + service_type',
        'OR category=platform_premium + duration',
      ]
    }

    return validation
  }

  const getValidationIcon = (validation: MetadataValidation) => {
    if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else {
      return <X className="h-4 w-4 text-red-600" />
    }
  }

  const getProductTypeLabel = (
    productType: MetadataValidation['productType'],
  ) => {
    switch (productType) {
      case 'trainer_service':
        return { text: 'Trainer Service', className: 'text-green-600' }
      case 'trainer_coaching':
        return { text: 'Trainer Coaching', className: 'text-purple-600' }
      case 'premium':
        return { text: 'Premium', className: 'text-yellow-600' }
      default:
        return { text: 'Unknown', className: 'text-gray-600' }
    }
  }

  const invalidProducts = products.filter((p) => !validations[p.id]?.isValid)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          Metadata Diagnostics
          {invalidProducts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {invalidProducts.length} issues
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
        dialogTitle="Product Metadata Diagnostics"
      >
        <DialogHeader>
          <DialogTitle>Product Metadata Diagnostics</DialogTitle>
          <DialogDescription>
            Check which active products have the required metadata for syncing
            to the database. Archived products are excluded.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading products...</div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{products.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-600">
                      Valid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {
                        products.filter((p) => validations[p.id]?.isValid)
                          .length
                      }
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-600">
                      Invalid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {invalidProducts.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Requirements Guide */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Required Metadata</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2 text-sm">
                    <div>
                      <strong>Trainer Service:</strong> category + service_type
                    </div>
                    <div>
                      <strong>Premium:</strong> category=platform_premium +
                      duration
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Validation Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Issues</TableHead>
                        <TableHead>Metadata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => {
                        const validation = validations[product.id]
                        const typeInfo = getProductTypeLabel(
                          validation?.productType,
                        )

                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {product.id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={typeInfo.className}
                              >
                                {typeInfo.text}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getValidationIcon(validation)}
                                <span className="text-sm">
                                  {validation?.isValid ? 'Valid' : 'Invalid'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {validation?.errors.map((error, i) => (
                                  <div key={i} className="text-xs text-red-600">
                                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                                    {error}
                                  </div>
                                ))}
                                {validation?.warnings.map((warning, i) => (
                                  <div
                                    key={i}
                                    className="text-xs text-yellow-600"
                                  >
                                    <Info className="h-3 w-3 inline mr-1" />
                                    {warning}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {Object.entries(product.metadata).length > 0 ? (
                                  Object.entries(product.metadata).map(
                                    ([key, value]) => (
                                      <div key={key}>
                                        <span className="font-medium">
                                          {key}:
                                        </span>{' '}
                                        {value}
                                      </div>
                                    ),
                                  )
                                ) : (
                                  <span className="text-gray-400">
                                    No metadata
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Action Items */}
              {invalidProducts.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Action Required</AlertTitle>
                  <AlertDescription>
                    {invalidProducts.length} product(s) need metadata fixes
                    before they can be synced. Add the required metadata in your
                    Stripe Dashboard under each product's "Metadata" section.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
