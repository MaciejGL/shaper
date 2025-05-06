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
  ...props
}: LinkProps &
  VariantProps<typeof buttonVariants> & {
    className?: string
    children: React.ReactNode
    disabled?: boolean
    iconStart?: React.ReactNode
    iconEnd?: React.ReactNode
  }) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {iconStart && <span className="mr-2">{iconStart}</span>}
      {children}
      {iconEnd && <span className="ml-2">{iconEnd}</span>}
    </Link>
  )
}

export { ButtonLink }
