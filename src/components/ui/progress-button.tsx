'use client'

import { LucideIcon } from 'lucide-react'
import { forwardRef } from 'react'

import { cn } from '@/lib/utils'

interface ProgressButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  progress?: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  isLoading?: boolean
}

const ProgressButton = forwardRef<HTMLButtonElement, ProgressButtonProps>(
  (
    {
      icon: Icon,
      progress = 0,
      size = 'md',
      variant = 'default',
      isLoading = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const circumference = 2 * Math.PI * 18 // radius of 18
    const strokeDashoffset = circumference - (progress / 100) * circumference

    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    }

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    }

    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline:
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'relative rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Progress circle - only show when uploading */}
        {isLoading && progress > 0 && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 40 40"
          >
            {/* Background circle */}
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.2"
            />
            {/* Progress circle */}
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
              opacity="0.8"
            />
          </svg>
        )}

        {/* Icon */}
        <Icon className={cn(iconSizes[size], isLoading && 'animate-pulse')} />

        {/* Optional children for additional content */}
        {children}
      </button>
    )
  },
)

ProgressButton.displayName = 'ProgressButton'

export { ProgressButton }
