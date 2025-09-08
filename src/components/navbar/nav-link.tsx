import { cva } from 'class-variance-authority'
import { ChevronRight } from 'lucide-react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useContext } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'

// Context for dropdown close functionality
const DropdownContext = createContext<{ closeDropdown?: () => void }>({})

export const DropdownProvider = DropdownContext.Provider
export const useDropdownContext = () => useContext(DropdownContext)

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  disabled?: boolean
  onClick?: () => void

  className?: string
}

export const navLinkVariants = cva(
  'w-full justify-start gap-3 transition-colors',
  {
    variants: {
      isActive: {
        true: 'hover:bg-accent/90 text-accent-foreground bg-accent',
        false: 'hover:bg-accent/90 hover:text-accent-foreground',
      },
      size: {
        default: 'h-12',
        sm: 'h-8',
        lg: 'h-12',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export function NavLink({
  href,
  icon,
  label,
  disabled,
  onClick,
  className,
}: NavItemProps) {
  const pathname = usePathname()
  const isActive = href === pathname
  const { closeDropdown } = useDropdownContext()

  const handleClick = () => {
    // Call the original onClick if provided
    onClick?.()
    // Close dropdown if we're inside one
    closeDropdown?.()
  }

  return (
    <NextLink href={href} className="w-full" scroll>
      <Button
        variant="ghost"
        disabled={disabled}
        className={cn(navLinkVariants({ isActive }), className)}
        iconStart={icon}
        onClick={handleClick}
      >
        <span className={cn('font-medium', className)}>{label}</span>
        {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-60" />}
      </Button>
    </NextLink>
  )
}
