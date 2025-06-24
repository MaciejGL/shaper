import { VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { Label } from './label'

type InputProps = Omit<React.ComponentProps<'input'>, 'size'> & {
  iconStart?: React.ReactNode
  iconEnd?: React.ReactNode
  label?: string
  id: string
  error?: string
  size?: 'sm' | 'md'
}

const inputVariants = cva(
  cn(
    'file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    'focus-visible:ring-ring focus-visible:inset-ring-[2px] focus-visible:-ring-offset-2',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
    'data-[error]:border-destructive data-[error]:ring-destructive/20 dark:data-[error]:ring-destructive/40 data-[error]:focus-visible:ring-destructive/20 dark:data-[error]:focus-visible:ring-destructive/40',
  ),
  {
    variants: {
      variant: {
        ghost: 'border-none bg-secondary shadow-none',
        inset:
          'border-input shadow-neuro-inset-light dark:shadow-neuro-inset-dark',
        outline: 'border-input shadow-none bg-secondary',
      },
      size: {
        sm: 'h-7',
        md: 'h-9',
      },
    },
    defaultVariants: {
      variant: 'inset',
      size: 'md',
    },
  },
)

export function Input({
  className,
  iconStart,
  iconEnd,
  type,
  label,
  id,
  error,
  size = 'md',
  variant = 'outline',
  ...props
}: InputProps & VariantProps<typeof inputVariants>) {
  return (
    <div className="space-y-1">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}

      <div className="relative group [&_svg]:transition-colors">
        {iconStart && (
          <div className="[&>svg]:size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground group-hover:text-foreground">
            {iconStart}
          </div>
        )}

        <input
          type={type}
          id={id}
          data-slot="input"
          data-error={error}
          className={cn(
            inputVariants({ size, variant }),
            { 'pl-10': iconStart, 'pr-10': iconEnd },
            className,
          )}
          {...props}
        />

        {iconEnd && (
          <div className="[&>svg]:size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground group-hover:text-foreground">
            {iconEnd}
          </div>
        )}
      </div>
    </div>
  )
}
