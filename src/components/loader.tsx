import { cva } from 'class-variance-authority'
import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

type LoaderProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const loaderVariants = cva('flex justify-center items-center h-full', {
  variants: {
    size: {
      xs: '[&>svg]:size-4',
      sm: '[&>svg]:size-6',
      md: '[&>svg]:size-8',
      lg: '[&>svg]:size-10',
      xl: '[&>svg]:size-12',
    },
  },
})

export function Loader({ size = 'md' }: LoaderProps) {
  return (
    <div className={cn(loaderVariants({ size }))}>
      <Loader2Icon className="animate-spin" />
    </div>
  )
}
