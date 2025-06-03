import { ArrowLeft } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button-link'

export function DashboardHeader({
  title,
  description,
  icon,
  prevSegment,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  prevSegment?: {
    label: string
    href: string
  }
}) {
  return (
    <div className="space-y-2 mb-12 mt-6">
      <div className="flex items-center gap-2">
        {prevSegment && (
          <ButtonLink
            variant="ghost"
            href={prevSegment.href}
            size="icon-lg"
            iconOnly={<ArrowLeft />}
          >
            {prevSegment.label}
          </ButtonLink>
        )}
        <div className="flex items-center gap-2 text-3xl">
          {icon && <span className="text-primary">{icon}</span>}
          <h1 className="font-medium tracking-tight">{title}</h1>
        </div>
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}
