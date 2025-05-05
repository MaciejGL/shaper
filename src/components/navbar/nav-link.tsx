import { cva } from 'class-variance-authority'
import { ChevronRight } from 'lucide-react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  disabled?: boolean
  onClick?: () => void

  className?: string
}

export const navLinkVariants = cva(
  'w-full justify-start gap-3 px-3 py-6 transition-colors',
  {
    variants: {
      isActive: {
        true: 'bg-violet-50 dark:bg-zinc-900 text-violet-500 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-zinc-800',
        false:
          'hover:bg-violet-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-100',
      },
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

  return (
    <NextLink href={href} className="w-full">
      <Button
        variant="ghost"
        disabled={disabled}
        className={cn(navLinkVariants({ isActive }), className)}
        iconStart={icon}
        onClick={onClick}
      >
        <span className={cn('font-medium', className)}>{label}</span>
        {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-60" />}
      </Button>
    </NextLink>
  )
}
