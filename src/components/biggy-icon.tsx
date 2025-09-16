import { VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const byggyIconVariants = cva(
  'bg-muted rounded-full flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'bg-muted-foreground/10 [&>svg]:text-muted-foreground',
        success: 'bg-green-500/10 [&>svg]:text-green-500',
        amber: 'bg-amber-500/15 [&>svg]:text-yellow-500',
      },
      size: {
        xs: 'size-8 [&>svg]:size-4',
        sm: 'size-12 [&>svg]:size-6',
        md: 'size-16 [&>svg]:size-8',
        lg: 'size-20 [&>svg]:size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

type BiggyIconProps = {
  icon: React.ElementType
} & VariantProps<typeof byggyIconVariants>
export function BiggyIcon({
  icon,
  variant = 'default',
  size = 'md',
}: BiggyIconProps) {
  const Icon = icon
  return (
    <div className={cn(byggyIconVariants({ variant, size }))}>
      <Icon />
    </div>
  )
}
