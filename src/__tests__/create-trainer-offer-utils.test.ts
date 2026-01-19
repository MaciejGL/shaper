import { describe, expect, it } from 'vitest'

import { validatePackages } from '@/lib/create-trainer-offer-utils'

describe('validatePackages', () => {
  it('allows a 90% promotional discount', () => {
    expect(() =>
      validatePackages([
        {
          packageId: 'pkg_1',
          quantity: 1,
          discountPercent: 90,
          discountMonths: 3,
        },
      ]),
    ).not.toThrow()
  })

  it('rejects a 91% promotional discount', () => {
    expect(() =>
      validatePackages([
        {
          packageId: 'pkg_1',
          quantity: 1,
          discountPercent: 91,
          discountMonths: 3,
        },
      ]),
    ).toThrow(/Discount percentage must be between/i)
  })
})

