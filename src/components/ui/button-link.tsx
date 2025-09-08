import type { VariantProps } from 'class-variance-authority'
import Link, { LinkProps } from 'next/link'
import * as React from 'react'

import { cn } from '@/lib/utils'

import { buttonVariants } from './button'

function ButtonLink({
  className,
  variant,
  size,
  children,
  iconStart,
  iconEnd,
  iconOnly,
  ...props
}: LinkProps &
  VariantProps<typeof buttonVariants> & {
    className?: string
    children: React.ReactNode
    disabled?: boolean
    iconStart?: React.ReactNode
    iconEnd?: React.ReactNode
    iconOnly?: React.ReactNode
  }) {
  const defaultSize = iconOnly ? 'icon-md' : size || 'md'
  return (
    <Link
      className={cn(
        'shrink-0',
        buttonVariants({ variant, size: defaultSize, className }),
      )}
      scroll
      {...props}
    >
      {iconStart && <span className="mr-2">{iconStart}</span>}
      {iconOnly && iconOnly}
      {iconOnly ? <span className="sr-only">{children}</span> : children}
      {iconEnd && <span className="ml-2">{iconEnd}</span>}
    </Link>
  )
}

export { ButtonLink }
