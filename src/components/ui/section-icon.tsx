import { VariantProps, cva } from 'class-variance-authority'
import { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const sectionIconVariants = cva(
  'rounded-xl flex items-center justify-center flex-shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-br from-gray-500 to-gray-600',
        blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
        yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
        orange: 'bg-gradient-to-br from-yellow-500 to-orange-500',
        purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
        green: 'bg-gradient-to-br from-green-500 to-green-600',
        red: 'bg-gradient-to-br from-red-500 to-red-600',
        pink: 'bg-gradient-to-br from-pink-500 to-pink-600',
        indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
        amber: 'bg-gradient-to-br from-amber-500 to-amber-600',
        sky: 'bg-gradient-to-br from-sky-500 to-sky-600',
        primary: 'bg-gradient-to-br from-sky-400 to-emerald-600',
      },
      size: {
        xs: 'w-6 h-6 [&>svg]:w-3.5 [&>svg]:h-3.5 rounded-lg',
        sm: 'w-8 h-8 [&>svg]:w-4 [&>svg]:h-4',
        md: 'w-10 h-10 [&>svg]:w-5 [&>svg]:h-5',
        lg: 'w-12 h-12 [&>svg]:w-6 [&>svg]:h-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface SectionIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionIconVariants> {
  icon: LucideIcon
  variant?: VariantProps<typeof sectionIconVariants>['variant']
}

export function SectionIcon({
  icon: Icon,
  variant,
  size,
  className,
  ...props
}: SectionIconProps) {
  return (
    <div
      className={cn(sectionIconVariants({ variant, size }), className)}
      {...props}
    >
      <Icon className="text-white" />
    </div>
  )
}
