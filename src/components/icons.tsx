'use client'

import { VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export const icons = {
  scale: () => (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="4.5"
        stroke="currentColor"
        strokeWidth="3"
      />
      <rect
        x="22.5"
        y="8.5"
        width="19"
        height="5"
        rx="2.5"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  ),
}

const iconVariants = cva('size-10 text-primary', {
  variants: {
    variant: {
      default: 'text-primary',
      muted: 'text-muted-foreground',
    },
    size: {
      xs: 'size-4',
      sm: 'size-6',
      md: 'size-8',
      lg: 'size-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

type IconProps = {
  name: keyof typeof icons
  variant?: VariantProps<typeof iconVariants>['variant']
  size?: VariantProps<typeof iconVariants>['size']
} & React.SVGProps<SVGSVGElement>

export function Icon({ name, variant, size, ...props }: IconProps) {
  const Icon = icons[name] as React.FC<React.SVGProps<SVGSVGElement>>
  return <Icon {...props} className={cn(iconVariants({ variant, size }))} />
}
