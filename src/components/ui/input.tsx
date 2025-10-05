import { VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { Label } from './label'

type InputProps = Omit<React.ComponentProps<'input'>, 'size'> & {
  iconStart?: React.ReactNode
  iconEnd?: React.ReactNode
  label?: string
  id: string
  errorMessage?: string
  error?: boolean
  size?: 'sm' | 'md'
}

const inputVariants = cva(
  cn(
    'file:text-foreground placeholder:text-muted-foreground/80 flex h-9 w-full min-w-0 rounded-md px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:text-sm file:font-medium disabled:pointer-events-none disabled:opacity-50 md:text-sm',
    'focus-visible:ring-ring focus-visible:ring-[1px] data-[error]:focus-visible:ring-destructive/20 dark:data-[error]:focus-visible:ring-destructive/40 leading-relaxed',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
    'data-[error]:border data-[error]:border-destructive data-[error]:ring-destructive/20 dark:data-[error]:ring-destructive/40 dark:data-[error]:focus-visible:ring-destructive/40',
  ),
  {
    variants: {
      variant: {
        ghost: 'bg-secondary shadow-none',
        secondary: 'shadow-none bg-primary/7 dark:bg-primary/8',
        outline: 'border-input shadow-none bg-secondary',
      },
      size: {
        sm: 'h-7 text-sm',
        md: 'h-9',
      },
    },
    defaultVariants: {
      variant: 'outline',
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
  errorMessage,
  error,
  size = 'md',
  variant = 'secondary',
  ...props
}: InputProps & VariantProps<typeof inputVariants>) {
  return (
    <div className="space-y-1">
      {label && (
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
      )}

      <div className="relative group [&_svg]:transition-colors">
        {iconStart && (
          <div className="[&>svg]:size-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary group-hover:text-primary dark:text-muted-foreground">
            {iconStart}
          </div>
        )}

        <input
          type={type}
          id={id}
          data-slot="input"
          data-error={errorMessage ?? error}
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

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  )
}
