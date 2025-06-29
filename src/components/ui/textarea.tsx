import { VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'

type TextareaProps = React.ComponentProps<'textarea'> & {
  error?: string
  label?: string
  id: string
}

const textareaVariants = cva(
  'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm data-[error]:border-destructive resize-none',
  {
    variants: {
      variant: {
        default: '',
        ghost: 'border-none bg-secondary shadow-none',
      },
    },
  },
)

function Textarea({
  className,
  error,
  label,
  id,
  variant = 'default',
  ...props
}: TextareaProps & VariantProps<typeof textareaVariants>) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <textarea
        id={id}
        data-slot="textarea"
        data-error={error}
        className={cn(textareaVariants({ variant }), className)}
        {...props}
      />
    </div>
  )
}

export { Textarea }
