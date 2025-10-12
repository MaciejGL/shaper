export interface CheckoutItem {
  packageId: string
  quantity: number
  package: {
    id: string
    name?: string | null
    stripeLookupKey?: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any // Use any to handle JsonValue from Prisma
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any // Allow other properties from the full package object
  }
}

export interface PackageWithDiscount {
  id: string
  name: string
  stripeLookupKey: string | null
  metadata: Record<string, unknown> | null
  serviceType?: string | null
}
