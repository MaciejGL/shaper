import { BiggyIcon } from './biggy-icon'
import { Card } from './ui/card'

export function EmptyStateCard({
  title,
  description,
  icon,
  cta,
}: {
  title: string
  description: string
  icon: React.ElementType
  cta?: React.ReactNode
}) {
  return (
    <Card
      borderless
      className="flex flex-col items-center justify-center py-12"
    >
      <div className="flex flex-col items-center justify-center">
        <BiggyIcon icon={icon} variant="default" />
        <div className="text-lg font-medium mb-2 mt-4">{title}</div>
        <div className="text-muted-foreground text-center max-w-[35ch] text-sm">
          {description}
        </div>
        {cta && <div className="mt-4">{cta}</div>}
      </div>
    </Card>
  )
}
